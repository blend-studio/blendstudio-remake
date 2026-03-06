using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    /// <summary>
    /// Gestisce la scrittura degli eventi di telemetria su MongoDB.
    /// La lettura e l'analisi dei dati sono delegate al servizio Analytics Python (porta 8001).
    /// </summary>
    [ApiController]
    [Route("api/telemetry")]
    public class TelemetryController : ControllerBase
    {
        private readonly MongoService _mongoService;

        public TelemetryController(MongoService mongoService)
        {
            _mongoService = mongoService;
        }

        /// <summary>
        /// POST /api/telemetry/track — Salva un evento di navigazione in MongoDB.
        /// Imposta il Timestamp lato server (UTC) e genera un SessionId casuale se mancante.
        /// Non richiede autenticazione.
        /// </summary>
        /// <param name="ev">Evento inviato dall'hook useTelemetry del frontend.</param>
        [HttpPost("track")]
        public async Task<IActionResult> TrackEvent([FromBody] TelemetryEvent ev)
        {
            ev.Timestamp = DateTime.UtcNow;
            if (string.IsNullOrWhiteSpace(ev.SessionId))
                ev.SessionId = Guid.NewGuid().ToString("N")[..8];

            var collection = _mongoService.GetCollection<TelemetryEvent>("telemetry");
            await collection.InsertOneAsync(ev);
            return Ok();
        }
    }
}

