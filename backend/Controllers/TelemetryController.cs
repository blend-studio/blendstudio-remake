using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
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

        // ── POST /api/telemetry/track ─────────────────────────────────────────
        [HttpPost("track")]
        public async Task<IActionResult> TrackEvent([FromBody] TelemetryEvent ev)
        {
            ev.Timestamp = DateTime.UtcNow;
            // Normalise session id
            if (string.IsNullOrWhiteSpace(ev.SessionId))
                ev.SessionId = Guid.NewGuid().ToString("N")[..8];

            var collection = _mongoService.GetCollection<TelemetryEvent>("telemetry");
            await collection.InsertOneAsync(ev);
            return Ok();
        }

        // ── GET /api/telemetry/stats ──────────────────────────────────────────
        [HttpGet("stats")]
        [Authorize]
        public async Task<IActionResult> GetStats()
        {
            var col = _mongoService.GetCollection<TelemetryEvent>("telemetry");

            var total = await col.CountDocumentsAsync(_ => true);

            var today = DateTime.UtcNow.Date;
            var todayCount = await col.CountDocumentsAsync(
                Builders<TelemetryEvent>.Filter.Gte(e => e.Timestamp, today));

            // Unique sessions
            var sessions = await col.DistinctAsync<string>(
                "sessionId", Builders<TelemetryEvent>.Filter.Empty);
            var sessionList = await sessions.ToListAsync();

            // Top pages (top 5)
            var pagePipeline = new[]
            {
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$page" },
                    { "count", new BsonDocument("$sum", 1) }
                }),
                new BsonDocument("$sort", new BsonDocument("count", -1)),
                new BsonDocument("$limit", 5)
            };
            using var pageCursor = await col.AggregateAsync<BsonDocument>(pagePipeline);
            var topPages = await pageCursor.ToListAsync();

            // Top actions (top 5)
            var actionPipeline = new[]
            {
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$action" },
                    { "count", new BsonDocument("$sum", 1) }
                }),
                new BsonDocument("$sort", new BsonDocument("count", -1)),
                new BsonDocument("$limit", 5)
            };
            using var actionCursor = await col.AggregateAsync<BsonDocument>(actionPipeline);
            var topActions = await actionCursor.ToListAsync();

            return Ok(new
            {
                total_events = total,
                today_events = todayCount,
                unique_sessions = sessionList.Count,
                top_pages = topPages.Select(d => new
                {
                    page = d["_id"].AsString,
                    count = d["count"].AsInt32
                }),
                top_actions = topActions.Select(d => new
                {
                    action = d["_id"].AsString,
                    count = d["count"].AsInt32
                }),
                generated_at = DateTime.UtcNow
            });
        }

        // ── GET /api/telemetry/trends?days=30 ────────────────────────────────
        [HttpGet("trends")]
        [Authorize]
        public async Task<IActionResult> GetTrends([FromQuery] int days = 30)
        {
            if (days < 1 || days > 365) days = 30;
            var col = _mongoService.GetCollection<TelemetryEvent>("telemetry");

            var from = DateTime.UtcNow.Date.AddDays(-days + 1);
            var filter = Builders<TelemetryEvent>.Filter.Gte(e => e.Timestamp, from);

            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument("timestamp",
                    new BsonDocument("$gte", new BsonDateTime(from)))),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", new BsonDocument("$dateToString", new BsonDocument
                        { { "format", "%Y-%m-%d" }, { "date", "$timestamp" } }) },
                    { "count", new BsonDocument("$sum", 1) },
                    { "sessions", new BsonDocument("$addToSet", "$sessionId") }
                }),
                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };

            using var cursor = await col.AggregateAsync<BsonDocument>(pipeline);
            var raw = await cursor.ToListAsync();

            // Fill missing days with 0
            var result = new List<object>();
            for (int i = 0; i < days; i++)
            {
                var date = from.AddDays(i).ToString("yyyy-MM-dd");
                var match = raw.FirstOrDefault(d => d["_id"].AsString == date);
                result.Add(new
                {
                    date,
                    events = match != null ? match["count"].AsInt32 : 0,
                    sessions = match != null ? match["sessions"].AsBsonArray.Count : 0
                });
            }

            return Ok(result);
        }

        // ── GET /api/telemetry/events?page=1&limit=50&action=&pagePath= ──────
        [HttpGet("events")]
        [Authorize]
        public async Task<IActionResult> GetEvents(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 50,
            [FromQuery] string? action = null,
            [FromQuery] string? pagePath = null)
        {
            if (page < 1) page = 1;
            if (limit < 1 || limit > 200) limit = 50;

            var col = _mongoService.GetCollection<TelemetryEvent>("telemetry");
            var filterBuilder = Builders<TelemetryEvent>.Filter;
            var filter = filterBuilder.Empty;

            if (!string.IsNullOrWhiteSpace(action))
                filter &= filterBuilder.Eq(e => e.Action, action);
            if (!string.IsNullOrWhiteSpace(pagePath))
                filter &= filterBuilder.Eq(e => e.Page, pagePath);

            var total = await col.CountDocumentsAsync(filter);
            var events = await col
                .Find(filter)
                .SortByDescending(e => e.Timestamp)
                .Skip((page - 1) * limit)
                .Limit(limit)
                .ToListAsync();

            return Ok(new { total, page, limit, data = events });
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
        // enrichment fields set by hook
        public string? Referrer { get; set; }
        public string? UserAgent { get; set; }
        public string? Language { get; set; }
        public int? ScreenW { get; set; }
        public int? ScreenH { get; set; }
    }
}

