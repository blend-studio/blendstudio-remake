using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/content")]
    public class ContentController : ControllerBase
    {
        private readonly MongoService _mongoService;

        public ContentController(MongoService mongoService)
        {
            _mongoService = mongoService;
        }

        [HttpGet("{slug}")]
        public async Task<IActionResult> GetContent(string slug)
        {
            var content = await _mongoService.GetContentBySlugAsync(slug);
            if (content == null) return NotFound(new { message = "Contenuto non trovato" });
            return Ok(content);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{slug}")]
        public async Task<IActionResult> UpdateContent(string slug, [FromBody] PageContent content)
        {
            content.Slug = slug;
            content.UpdatedAt = DateTime.UtcNow;
            await _mongoService.UpdateContentAsync(slug, content);
            return Ok(new { message = "Contenuto aggiornato con successo" });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllContent()
        {
            var contents = await _mongoService.GetAllContentAsync();
            return Ok(contents);
        }
    }
}
