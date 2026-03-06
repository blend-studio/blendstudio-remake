using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace backend.Controllers
{
    /// <summary>
    /// Dashboard Operativa Wrike — dati in tempo reale dal MongoDB locale.
    ///
    /// Tutti gli endpoint richiedono autenticazione JWT (ruolo Admin).
    ///
    /// GET  /api/wrike/dashboard      → KPI aggregati
    /// GET  /api/wrike/workload       → carico per membro del team
    /// GET  /api/wrike/bottlenecks    → task bloccati da troppo tempo
    /// POST /api/wrike/sync           → forza sincronizzazione manuale
    /// </summary>
    [ApiController]
    [Route("api/wrike")]
    [Authorize]
    public class WrikeController : ControllerBase
    {
        private readonly WrikeService _wrike;
        private readonly ILogger<WrikeController> _logger;

        public WrikeController(WrikeService wrike, ILogger<WrikeController> logger)
        {
            _wrike = wrike;
            _logger = logger;
        }

        // ── GET /api/wrike/dashboard ──────────────────────────────────────────

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var col = _wrike.TasksCollection;

            // Carichiamo tutti i task in un'unica query anziché fare
            // N query separate per ogni status: MongoDB è locale nel Docker network
            // quindi il costo di una query larga è trascurabile rispetto a N round-trip.
            // Il filtro include anche Deferred e Cancelled per mostrare i breakdown
            // completi nella dashboard (torta per status).
            var all = await col
                .Find(Builders<WrikeTaskSnapshot>.Filter.In(
                    t => t.Status, new[] { "Active", "InProgress", "Completed", "Deferred", "Cancelled" }))
                .ToListAsync();

            // Partizioniamo in memoria: molto più veloce di N query MongoDB separate.
            var active    = all.Where(t => t.Status is "Active" or "InProgress").ToList();
            var completed = all.Where(t => t.Status == "Completed").ToList();
            var delayed   = active.Where(t => t.IsDelayed).ToList();   // già calcolato al sync
            var deferred  = all.Where(t => t.Status == "Deferred").ToList();

            // ByStatus: distribuzione per stato (usato per grafico a torta).
            var byStatus = all
                .GroupBy(t => t.Status)
                .Select(g => new WrikeStatusBreakdownDto(g.Key, g.Count()))
                .ToList();

            // ByImportance: solo i task attivi (i completati hanno priorità storica non rilevante).
            var byImportance = active
                .GroupBy(t => t.Importance)
                .Select(g => new WrikeImportanceBreakdownDto(g.Key, g.Count()))
                .OrderByDescending(x => x.Count)
                .ToList();

            // Tempo medio "fermo" per status: indica colli di bottiglia sistemici
            // (valore alto = i task tendono a bloccarsi, non solo singoli outlier).
            var avgDays = active.Count > 0
                ? active.Average(t => t.DaysInCurrentStatus)
                : 0;

            return Ok(new WrikeDashboardDto(
                ActiveTasksCount: active.Count,
                CompletedTasksCount: completed.Count,
                DelayedTasksCount: delayed.Count,
                DeferredTasksCount: deferred.Count,
                AvgDaysInCurrentStatus: Math.Round(avgDays, 1),
                ByStatus: byStatus,
                ByImportance: byImportance
            ));
        }

        // ── GET /api/wrike/workload ───────────────────────────────────────────

        [HttpGet("workload")]
        public async Task<IActionResult> GetWorkload()
        {
            var taskCol    = _wrike.TasksCollection;
            var contactCol = _wrike.ContactsCollection;

            // Leggiamo solo i task attivi (Active+InProgress): quelli completati
            // hanno già un esito noto e non contribuiscono al carico di lavoro attuale.
            var activeTasks = await taskCol
                .Find(Builders<WrikeTaskSnapshot>.Filter.In(
                    t => t.Status, new[] { "Active", "InProgress" }))
                .ToListAsync();

            // Mappa contactId → nome completo: usata per sostituire gli ID Wrike
            // con nomi leggibili nella risposta JSON.
            var contacts = await contactCol.Find(_ => true).ToListAsync();
            var nameMap = contacts.ToDictionary(
                c => c.ContactId,
                c => $"{c.FirstName} {c.LastName}".Trim());

            // SelectMany "esplode" ogni task in N righe (una per assegnatario),
            // poi GroupBy ricostruisce per assegnatario la lista dei task.
            // Un task con 2 assegnatari viene contato nel carico di ENTRAMBI.
            var workload = activeTasks
                .SelectMany(t => t.AssigneeIds.Select(aid => new { aid, task = t }))
                .GroupBy(x => x.aid)
                .Select(g =>
                {
                    var tasks = g.Select(x => x.task).ToList();
                    return new WrikeWorkloadDto(
                        AssigneeId: g.Key,
                        // Se l'ID non è in wrike_contacts (utente esterno/ospite), mostra l'ID grezzo.
                        AssigneeName: nameMap.TryGetValue(g.Key, out var n) ? n : g.Key,
                        TotalTasks: tasks.Count,
                        HighPriorityTasks: tasks.Count(t => t.Importance == "High"),
                        DelayedTasks: tasks.Count(t => t.IsDelayed),
                        // Ordinamento: High prima, poi per scadenza più imminente.
                        Tasks: tasks
                            .OrderByDescending(t => t.Importance == "High")
                            .ThenBy(t => t.DueDate)
                            .Select(t => new WrikeTaskSummaryDto(
                                TaskId: t.TaskId,
                                Title: t.Title,
                                Status: t.Status,
                                Importance: t.Importance,
                                DueDate: t.DueDate,
                                IsDelayed: t.IsDelayed,
                                DaysInCurrentStatus: t.DaysInCurrentStatus,
                                RiskScore: t.RiskScore,
                                Permalink: t.Permalink
                            ))
                            .ToList()
                    );
                })
                // Member con più task in cima: utile per identificare chi è sovraccarico.
                .OrderByDescending(w => w.TotalTasks)
                .ToList();

            return Ok(workload);
        }

        // ── GET /api/wrike/bottlenecks?minDays=5 ─────────────────────────────

        [HttpGet("bottlenecks")]
        public async Task<IActionResult> GetBottlenecks([FromQuery] int minDays = 5)
        {
            var taskCol    = _wrike.TasksCollection;
            var contactCol = _wrike.ContactsCollection;

            // “Collo di bottiglia” = task attivo che è rimasto nello stesso status
            // per almeno minDays giorni consecutivi.
            // Default 5 giorni: una settimana lavorativa è una soglia ragionevole
            // per una PMI. Il frontend può passare ?minDays=N per soglie diverse.
            var stuckFilter = Builders<WrikeTaskSnapshot>.Filter.And(
                Builders<WrikeTaskSnapshot>.Filter.In(t => t.Status, new[] { "Active", "InProgress" }),
                Builders<WrikeTaskSnapshot>.Filter.Gte(t => t.DaysInCurrentStatus, minDays)
            );

            // Limit(50): evita payload giganti al frontend se il filtro è largho;
            // i task più bloccati sono sempre in cima grazie all'ordinamento DESC.
            var stuck = await taskCol.Find(stuckFilter)
                .SortByDescending(t => t.DaysInCurrentStatus)
                .Limit(50)
                .ToListAsync();

            var contacts = await contactCol.Find(_ => true).ToListAsync();
            var nameMap = contacts.ToDictionary(c => c.ContactId, c => $"{c.FirstName} {c.LastName}".Trim());

            var result = stuck.Select(t => new WrikeBottleneckDto(
                TaskId: t.TaskId,
                Title: t.Title,
                Status: t.Status,
                Importance: t.Importance,
                DaysInCurrentStatus: t.DaysInCurrentStatus,
                AssigneeIds: t.AssigneeIds,
                AssigneeNames: t.AssigneeIds
                    .Select(id => nameMap.TryGetValue(id, out var n) ? n : id)
                    .ToList(),
                DueDate: t.DueDate,
                Permalink: t.Permalink
            )).ToList();

            return Ok(result);
        }

        // ── POST /api/wrike/sync ──────────────────────────────────────────────

        [HttpPost("sync")]
        public async Task<IActionResult> ForceSync(CancellationToken ct)
        {
            _logger.LogInformation("[WrikeController] Sincronizzazione manuale richiesta da {User}.",
                User.Identity?.Name);
            await _wrike.SyncAllAsync(ct);
            return Ok(new { message = "Sincronizzazione completata." });
        }
    }
}
