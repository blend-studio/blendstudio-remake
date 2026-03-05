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

        // Metodi helper per i contenuti delle pagine
        public async Task<List<PageContent>> GetAllContentAsync()
        {
            var collection = _database.GetCollection<PageContent>("contents");
            return await collection.Find(_ => true).ToListAsync();
        }

        public async Task<PageContent> GetContentBySlugAsync(string slug)
        {
            var collection = _database.GetCollection<PageContent>("contents");
            return await collection.Find(c => c.Slug == slug).FirstOrDefaultAsync();
        }

        public async Task UpdateContentAsync(string slug, PageContent content)
        {
            var collection = _database.GetCollection<PageContent>("contents");
            await collection.ReplaceOneAsync(c => c.Slug == slug, content, new ReplaceOptions { IsUpsert = true });
        }
    }

    public class PageContent
    {
        public string? Id { get; set; }
        public string Slug { get; set; } = string.Empty;
        public Dictionary<string, object> Data { get; set; } = new();
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
