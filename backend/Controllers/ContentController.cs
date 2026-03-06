using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    /// <summary>
    /// Espone i contenuti CMS pubblici per slug (usato dal frontend per caricare testi delle pagine).
    /// Percorso: GET /api/content/{slug}
    /// </summary>
    [ApiController]
    [Route("api/content")]
    public class ContentController : ControllerBase
    {
        private readonly MongoService _mongoService;

        public ContentController(MongoService mongoService)
        {
            _mongoService = mongoService;
        }

        /// <summary>
        /// GET /api/content/{slug} — Recupera il contenuto di una pagina dal suo slug MongoDB.
        /// Restituisce 404 se lo slug non esiste.
        /// </summary>
        /// <param name="slug">Identificatore univoco del contenuto (es. "home", "servizi").</param>
        [HttpGet("{slug}")]
        public async Task<IActionResult> GetContent(string slug)
        {
            var content = await _mongoService.GetContentBySlugAsync(slug);
            if (content == null) return NotFound(new { message = "Contenuto non trovato" });
            return Ok(content);
        }
    }

    /// <summary>
    /// CRUD dei contenuti CMS per il pannello admin. Tutti gli endpoint richiedono JWT.
    /// I contenuti sono archiviati in MongoDB (collection "contents").
    /// Percorso base: /api/admin/content
    /// </summary>
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

        /// <summary>
        /// GET /api/admin/content — Restituisce tutti i blocchi di contenuto presenti in MongoDB.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var contents = await _mongoService.GetAllContentAsync();
            return Ok(new { status = "success", data = contents });
        }

        /// <summary>
        /// GET /api/admin/content/{slug} — Restituisce il contenuto di una singola pagina per slug.
        /// Restituisce 404 se lo slug non esiste.
        /// </summary>
        /// <param name="slug">Slug del contenuto da recuperare.</param>
        [HttpGet("{slug}")]
        public async Task<IActionResult> GetOne(string slug)
        {
            var content = await _mongoService.GetContentBySlugAsync(slug);
            if (content == null) return NotFound(new { status = "error", message = "Slug non trovato" });
            return Ok(new { status = "success", data = content });
        }

        /// <summary>
        /// PUT /api/admin/content/{slug} — Crea o aggiorna il contenuto associato allo slug (upsert).
        /// Il campo Slug nel body viene sovrascritto con quello del path per coerenza.
        /// </summary>
        /// <param name="slug">Slug del contenuto da creare/aggiornare.</param>
        /// <param name="content">Nuovo contenuto da salvare.</param>
        [HttpPut("{slug}")]
        public async Task<IActionResult> UpdateContent(string slug, [FromBody] PageContent content)
        {
            content.Slug = slug;
            await _mongoService.UpdateContentAsync(slug, content);
            return Ok(new { status = "success", message = "Contenuto aggiornato" });
        }
    }
}
