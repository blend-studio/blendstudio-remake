using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    // ── Public: GET /api/content/{slug} ──────────────────────────────────────
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
    }

    // ── Admin: /api/admin/content/* ──────────────────────────────────────────
    [ApiController]
    [Route("api/admin/content")]
    [Authorize]
    public class AdminContentController : ControllerBase
    {
        private readonly MongoService _mongoService;

        public AdminContentController(MongoService mongoService)
        {
            _mongoService = mongoService;
        }

        // GET /api/admin/content
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var contents = await _mongoService.GetAllContentAsync();
            return Ok(new { status = "success", data = contents });
        }

        // GET /api/admin/content/{slug}
        [HttpGet("{slug}")]
        public async Task<IActionResult> GetOne(string slug)
        {
            var content = await _mongoService.GetContentBySlugAsync(slug);
            if (content == null) return NotFound(new { status = "error", message = "Slug non trovato" });
            return Ok(new { status = "success", data = content });
        }

        // PUT /api/admin/content/{slug}
        [HttpPut("{slug}")]
        public async Task<IActionResult> UpdateContent(string slug, [FromBody] PageContent content)
        {
            content.Slug = slug;
            await _mongoService.UpdateContentAsync(slug, content);
            return Ok(new { status = "success", message = "Contenuto aggiornato" });
        }
    }
}
