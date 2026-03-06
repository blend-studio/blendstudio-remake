using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;
using backend.Models;
using MongoDB.Driver;

namespace backend.Services
{
    /// <summary>
    /// Comunica con l'API REST Wrike v4 e sincronizza i dati in MongoDB.
    ///
    /// Flusso dati:
    ///   WrikeSyncJob (ogni 15 min)
    ///     → WrikeService.SyncAllAsync()
    ///         → GET /contacts   → upsert "wrike_contacts"
    ///         → GET /tasks (Active + Completed) → upsert "wrike_tasks"
    ///             → calcola isDelayed, delayDays, daysInCurrentStatus
    ///
    /// La collection "wrike_tasks" viene poi letta da:
    ///   - WrikeController  → dashboard in tempo reale
    ///   - analytics/routers/wrike.py → ML risk scoring + workload forecast
    /// </summary>
    public class WrikeService
    {
        private static readonly string BaseUrl = "https://www.wrike.com/api/v4";

        // JSON options per deserializzare le risposte Wrike (camelCase)
        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNameCaseInsensitive = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };

        private readonly IMongoDatabase _db;
        private readonly string _accessToken;
        private readonly ILogger<WrikeService> _logger;

        public WrikeService(IMongoClient mongoClient, IConfiguration configuration, ILogger<WrikeService> logger)
        {
            _logger = logger;
            _accessToken = configuration["WRIKE_ACCESS_TOKEN"]
                ?? throw new InvalidOperationException("WRIKE_ACCESS_TOKEN non configurato.");

            var dbName = configuration["MONGO_DATABASE_NAME"] ?? "blendstudio";
            _db = mongoClient.GetDatabase(dbName);
        }

        // ── Sync completo ──────────────────────────────────────────────────────

        /// <summary>
        /// Punto di ingresso principale: sincronizza contatti + task.
        /// Chiamato ogni 15 minuti da WrikeSyncJob.
        /// </summary>
        public async Task SyncAllAsync(CancellationToken ct = default)
        {
            _logger.LogInformation("[Wrike] Avvio sincronizzazione...");

            // 1. Contatti prima dei task: MapToSnapshot() li usa per risolvere i nomi.
            await SyncContactsAsync(ct);

            // 2. Task attivi: nessun filtro data (vogliamo TUTTI gli aperti).
            await SyncTasksAsync("Active", ct);

            // 3. Task completati: solo gli ultimi 90 giorni per limitare il volume
            //    di dati scaricati ad ogni sync. Per un training ML più ricco,
            //    aumentare questo intervallo (ma attento ai rate limit Wrike).
            var since = DateTime.UtcNow.AddDays(-90).ToString("yyyy-MM-dd'T'00:00:00'Z'");
            await SyncTasksAsync("Completed", ct, completedSince: since);

            _logger.LogInformation("[Wrike] Sincronizzazione completata.");
        }

        // ── Contacts ──────────────────────────────────────────────────────────

        private async Task SyncContactsAsync(CancellationToken ct)
        {
            var contacts = await GetAsync<WrikeApiContact>("/contacts", ct);
            if (contacts.Count == 0) return;

            var col = _db.GetCollection<WrikeContact>("wrike_contacts");
            var now = DateTime.UtcNow;

            var writes = contacts
                // Escludiamo Type="Group": sono team virtuali Wrike, non persone reali.
                // Memorizzarli sporcherebbe la dropdown "assegnatari" nel frontend.
                .Where(c => c.Type == "Person")
                .Select(c =>
                {
                    var doc = new WrikeContact
                    {
                        ContactId = c.Id,
                        FirstName = c.FirstName,
                        LastName  = c.LastName,
                        Type      = c.Type,
                        LastSyncAt = now,
                    };
                    // Upsert per contactId: se l'utente è già nel DB lo aggiorna
                    // (es. cambio nome), altrimenti lo inserisce.
                    var filter = Builders<WrikeContact>.Filter.Eq(d => d.ContactId, c.Id);
                    return new ReplaceOneModel<WrikeContact>(filter, doc) { IsUpsert = true };
                })
                .Cast<WriteModel<WrikeContact>>()
                .ToList();

            // BulkWrite riduce N operazioni separate a 1 singola richiesta MongoDB.
            if (writes.Count > 0) await col.BulkWriteAsync(writes, cancellationToken: ct);
            _logger.LogInformation("[Wrike] Sincronizzati {Count} contatti.", writes.Count);
        }

        // ── Tasks ─────────────────────────────────────────────────────────────

        private async Task SyncTasksAsync(string status, CancellationToken ct, string? completedSince = null)
        {
            // L'API Wrike richiede di specificare esplicitamente i campi extra
            // tramite il parametro "fields". Senza di essi, commentCount,
            // attachmentCount, effortAllocation ecc. non vengono restituiti.
            var endpoint = $"/tasks?status={status}&limit=1000"
                + "&fields=[\"responsibleIds\",\"parentIds\",\"superParentIds\",\"authorIds\","
                + "\"commentCount\",\"attachmentCount\",\"effortAllocation\",\"permalink\","
                + "\"description\",\"dates\",\"importance\"]";

            // Filtro data di completamento: passato solo per status=Completed.
            // Formato richiesto da Wrike: { "start": "2025-12-07T00:00:00Z" }
            if (completedSince != null)
                endpoint += $"&completedDate={{\"start\":\"{completedSince}\"}}";

            var tasks = await GetAsync<WrikeApiTask>(endpoint, ct);
            if (tasks.Count == 0) return;

            var col = _db.GetCollection<WrikeTaskSnapshot>("wrike_tasks");
            var now = DateTime.UtcNow;

            // ── Calcolo daysInCurrentStatus ─────────────────────────────────────
            // Wrike non espone direttamente "da quanti giorni questo task è in questo status".
            // La nostra soluzione è delta-based: confrontiamo il nuovo status con quello
            // dell'ultimo snapshot in MongoDB. Se sono uguali, incrementiamo;
            // se sono diversi, resettiamo a 0 e salviamo statusChangedAt = ora.
            // Limitazione: se due sync consecutivi saltano un cambio di status
            // (task passa a Completed e torna ad Active tra un sync e l'altro),
            // il contatore sarà errato. Soluzione V2: polling /audit_log.
            var existingDocs = await col
                .Find(Builders<WrikeTaskSnapshot>.Filter.In(d => d.TaskId, tasks.Select(t => t.Id)))
                .ToListAsync(ct);

            var existingMap = existingDocs.ToDictionary(d => d.TaskId);

            var writes = tasks.Select(task =>
            {
                var snapshot = MapToSnapshot(task, now, existingMap.TryGetValue(task.Id, out var prev) ? prev : null);
                var filter = Builders<WrikeTaskSnapshot>.Filter.Eq(d => d.TaskId, task.Id);
                return new ReplaceOneModel<WrikeTaskSnapshot>(filter, snapshot) { IsUpsert = true };
            })
            .Cast<WriteModel<WrikeTaskSnapshot>>()
            .ToList();

            await col.BulkWriteAsync(writes, cancellationToken: ct);
            _logger.LogInformation("[Wrike] Sincronizzati {Count} task [{Status}].", writes.Count, status);
        }

        // ── Mapping ───────────────────────────────────────────────────────────

        private static WrikeTaskSnapshot MapToSnapshot(WrikeApiTask task, DateTime now, WrikeTaskSnapshot? prev)
        {
            var createdDate = ParseDate(task.CreatedDate);
            var completedDate = ParseDate(task.CompletedDate);
            var startDate = task.Dates?.Start != null ? ParseDate(task.Dates.Start) : (DateTime?)null;
            var dueDate = task.Dates?.Due != null ? ParseDate(task.Dates.Due) : (DateTime?)null;

            // Ritardo: per task completati confronta completedDate vs dueDate;
            // per task attivi usa now.
            bool isDelayed = false;
            int? delayDays = null;
            if (dueDate.HasValue)
            {
                if (task.Status == "Completed" && completedDate.HasValue)
                {
                    delayDays = (int)(completedDate.Value - dueDate.Value).TotalDays;
                    isDelayed = delayDays > 0;
                }
                else if (task.Status == "Active" || task.Status == "InProgress")
                {
                    delayDays = (int)(now - dueDate.Value).TotalDays;
                    isDelayed = delayDays > 0;
                }
            }

            // daysInCurrentStatus: se il precedente snapshot ha lo stesso status,
            // incrementiamo; altrimenti parte da 0.
            int daysInCurrentStatus = 0;
            DateTime? statusChangedAt = now;
            if (prev != null)
            {
                if (prev.Status == task.Status && prev.StatusChangedAt.HasValue)
                {
                    statusChangedAt = prev.StatusChangedAt;
                    daysInCurrentStatus = (int)(now - prev.StatusChangedAt.Value).TotalDays;
                }
            }

            return new WrikeTaskSnapshot
            {
                TaskId = task.Id,
                Title = task.Title,
                Status = task.Status,
                Importance = task.Importance,
                // ProjectId: in Wrike i task stanno in folder annidate.
                // SuperParentIds è il livello più alto (≈ progetto), ParentIds è la sottocartella.
                // Preferiamo il SuperParent come identificatore di progetto, con fallback su Parent.
                ProjectId = task.SuperParentIds.FirstOrDefault() ?? task.ParentIds.FirstOrDefault(),
                AssigneeIds = task.ResponsibleIds,   // rinominato per chiarezza semantica
                AuthorId = task.AuthorIds.FirstOrDefault(),
                CreatedDate = createdDate,
                StartDate = startDate,
                DueDate = dueDate,
                CompletedDate = completedDate,
                EstimatedMinutes = task.EffortAllocation?.TotalEffort,
                SpentMinutes = task.EffortAllocation?.AllocatedEffort,
                CommentCount = task.CommentCount,
                AttachmentCount = task.AttachmentCount,
                Permalink = task.Permalink,
                DaysInCurrentStatus = daysInCurrentStatus,
                StatusChangedAt = statusChangedAt,
                IsDelayed = isDelayed,
                DelayDays = delayDays,
                // RiskScore: preserviamo l'ultimo score ML già calcolato dal microservizio Python.
                // Se sovrascrivessimo con null a ogni sync, perderemmo la previsione che il
                // frontend sta già mostrando, in attesa del prossimo ciclo di inferenza.
                RiskScore = prev?.RiskScore,
                LastSyncAt = now,
            };
        }

        // ── HTTP helper ───────────────────────────────────────────────────────

        private async Task<List<T>> GetAsync<T>(string relativeUrl, CancellationToken ct)
        {
            // Nota: stiamo istanziando un nuovo HttpClient per ogni chiamata.
            // In produzione con molte richieste si dovrebbe usare IHttpClientFactory
            // per evitare socket exhaustion. Per il volume attuale (sync ogni 15 min)
            // questa implementazione semplice è sufficiente.
            using var http = BuildHttpClient();
            var url = BaseUrl + relativeUrl;

            _logger.LogDebug("[Wrike] GET {Url}", url);
            var response = await http.GetAsync(url, ct);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(ct);
                // Logghiamo come Warning: un errore API non interrompe il sync degli altri status.
                _logger.LogWarning("[Wrike] API error {Status}: {Body}", (int)response.StatusCode, body);
                return new List<T>();
            }

            var json = await response.Content.ReadAsStringAsync(ct);
            var result = JsonSerializer.Deserialize<WrikeApiResponse<T>>(json, _jsonOptions);
            return result?.Data ?? new List<T>();
        }

        private HttpClient BuildHttpClient()
        {
            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _accessToken);
            client.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json"));
            return client;
        }

        // ── Read helpers (usati dal controller) ───────────────────────────────

        public IMongoCollection<WrikeTaskSnapshot> TasksCollection =>
            _db.GetCollection<WrikeTaskSnapshot>("wrike_tasks");

        public IMongoCollection<WrikeContact> ContactsCollection =>
            _db.GetCollection<WrikeContact>("wrike_contacts");

        private static DateTime? ParseDate(string? s)
        {
            if (string.IsNullOrWhiteSpace(s)) return null;
            return DateTime.TryParse(s, out var dt) ? dt.ToUniversalTime() : null;
        }
    }
}
