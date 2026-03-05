using System.Text.Json;
using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using Microsoft.Extensions.Configuration;

namespace backend.Services
{
    public class MongoService
    {
        private readonly IMongoDatabase _database;

        public MongoService(IMongoClient client, IConfiguration configuration)
        {
            var databaseName = configuration["MONGO_DATABASE_NAME"] ?? "blendstudio";
            _database = client.GetDatabase(databaseName);
        }

        public IMongoCollection<T> GetCollection<T>(string name)
        {
            return _database.GetCollection<T>(name);
        }

        private static JsonElement EmptyJson =>
            JsonDocument.Parse("{}").RootElement.Clone();

        private static PageContent Hydrate(PageContentDoc doc)
        {
            JsonElement data = EmptyJson;
            if (!string.IsNullOrWhiteSpace(doc.DataJson))
            {
                try { data = JsonDocument.Parse(doc.DataJson).RootElement.Clone(); } catch { }
            }
            return new PageContent { Id = doc.Id, Slug = doc.Slug, Data = data, UpdatedAt = doc.UpdatedAt };
        }

        public async Task<List<PageContent>> GetAllContentAsync()
        {
            var col = _database.GetCollection<PageContentDoc>("adminpanel");
            var docs = await col.Find(_ => true).ToListAsync();
            return docs.Select(Hydrate).ToList();
        }

        public async Task<PageContent?> GetContentBySlugAsync(string slug)
        {
            var col = _database.GetCollection<PageContentDoc>("adminpanel");
            var doc = await col.Find(c => c.Slug == slug).FirstOrDefaultAsync();
            return doc == null ? null : Hydrate(doc);
        }

        public async Task UpdateContentAsync(string slug, PageContent content)
        {
            var col = _database.GetCollection<PageContentDoc>("adminpanel");
            var doc = new PageContentDoc
            {
                Slug = slug,
                DataJson = content.Data.ValueKind != JsonValueKind.Undefined
                    ? JsonSerializer.Serialize(content.Data)
                    : "{}",
                UpdatedAt = DateTime.UtcNow
            };
            // Preserve existing _id if present
            var existing = await col.Find(c => c.Slug == slug).FirstOrDefaultAsync();
            if (existing != null) doc.Id = existing.Id;
            await col.ReplaceOneAsync(c => c.Slug == slug, doc, new ReplaceOptions { IsUpsert = true });
        }
    }

    // ── MongoDB storage model (internal) ────────────────────────────────────
    [BsonIgnoreExtraElements]
    public class PageContentDoc
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("slug")]
        public string Slug { get; set; } = string.Empty;

        [BsonElement("data_json")]
        public string DataJson { get; set; } = "{}";

        [BsonElement("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    // ── API DTO (exposed via HTTP) ───────────────────────────────────────────
    public class PageContent
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("slug")]
        public string Slug { get; set; } = string.Empty;

        [JsonPropertyName("data")]
        public JsonElement Data { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
