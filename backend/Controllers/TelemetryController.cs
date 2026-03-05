using backend.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/telemetry")]
    public class TelemetryController : ControllerBase
    {
        private readonly MongoService _mongoService;

        public TelemetryController(MongoService mongoService)
        {
            _mongoService = mongoService;
        }

        [HttpPost("track")]
        public async Task<IActionResult> TrackEvent([FromBody] TelemetryEvent ev)
        {
            ev.Timestamp = DateTime.UtcNow;
            var collection = _mongoService.GetCollection<TelemetryEvent>("telemetry");
            await collection.InsertOneAsync(ev);
            return Ok();
        }
    }

    public class TelemetryEvent
    {
        public string? Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Page { get; set; } = string.Empty;
        public string? ElementId { get; set; }
        public Dictionary<string, object>? Metadata { get; set; }
        public DateTime Timestamp { get; set; }
        public string? SessionId { get; set; }
    }
}
