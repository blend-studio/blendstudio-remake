using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace backend.Controllers;

/// <summary>
/// CRUD dei progetti del portfolio.
/// Gli endpoint di lettura sono pubblici; creazione, modifica e cancellazione richiedono JWT.
/// Le immagini gallery sono serializzate come JSON nel campo GalleryImages.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ProjectController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProjectController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// GET /api/projects — Restituisce tutti i progetti ordinati per data decrescente.
    /// Le gallery_images vengono deserializzate da JSON prima di essere esposte.
    /// </summary>
    [HttpGet]
    [Route("/api/projects")]
    public async Task<IActionResult> Index()
    {
        var projects = await _context.Projects
            .OrderByDescending(p => p.ProjectDate)
            .ToListAsync();

        var formattedProjects = projects.Select(p => new
        {
            p.Id,
            p.Title,
            p.Slug,
            p.Client,
            p.Services,
            p.Description,
            p.CoverImage,
            gallery_images = ParseGalleryImages(p.GalleryImages),
            p.LayoutType,
            p.ProjectDate
        });

        return Ok(new { status = "success", data = formattedProjects });
    }

    /// <summary>
    /// GET /api/project?id={id} o ?slug={slug} — Recupera un singolo progetto per id o slug.
    /// Restituisce 400 se nessun parametro è fornito, 404 se il progetto non esiste.
    /// </summary>
    /// <param name="id">Id numerico del progetto (opzionale).</param>
    /// <param name="slug">Slug testuale del progetto (opzionale, usato se id non fornito).</param>
    [HttpGet]
    [Route("/api/project")]
    public async Task<IActionResult> Show([FromQuery] int? id, [FromQuery] string? slug)
    {
        if (!id.HasValue && string.IsNullOrWhiteSpace(slug))
        {
            return BadRequest(new { status = "error", message = "ID o Slug mancante" });
        }

        Models.Project? project = null;

        if (id.HasValue)
        {
            project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id.Value);
        }
        else if (!string.IsNullOrWhiteSpace(slug))
        {
            project = await _context.Projects.FirstOrDefaultAsync(p => p.Slug == slug);
        }

        if (project != null)
        {
            var formattedProject = new
            {
                project.Id,
                project.Title,
                project.Slug,
                project.Client,
                project.Services,
                project.Description,
                project.CoverImage,
                gallery_images = ParseGalleryImages(project.GalleryImages),
                project.LayoutType,
                project.ProjectDate
            };

            return Ok(new { status = "success", data = formattedProject });
        }

        return NotFound(new { status = "error", message = "Progetto non trovato" });
    }

    /// <summary>
    /// POST /api/projects — Crea un nuovo progetto. Richiede JWT.
    /// Lo slug viene generato automaticamente dal titolo se non fornito.
    /// Restituisce 409 se lo slug è già in uso.
    /// </summary>
    /// <param name="request">Dati del progetto da creare.</param>
    [Authorize]
    [HttpPost]
    [Route("/api/projects")]
    public async Task<IActionResult> Create([FromBody] Models.Project request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { status = "error", message = "Dati non validi" });

        var slug = string.IsNullOrWhiteSpace(request.Slug)
            ? Slugify(request.Title)
            : request.Slug;

        var exists = await _context.Projects.AnyAsync(p => p.Slug == slug);
        if (exists)
            return Conflict(new { status = "error", message = "Slug già in uso" });

        request.Id = 0; // ignora eventuale id passato dal client
        request.Slug = slug;

        _context.Projects.Add(request);
        await _context.SaveChangesAsync();

        return Ok(new { status = "success", data = request });
    }

    /// <summary>
    /// PUT /api/projects/{id} — Aggiorna tutti i campi di un progetto esistente. Richiede JWT.
    /// Restituisce 404 se il progetto non esiste, 409 se il nuovo slug è già usato da un altro.
    /// </summary>
    /// <param name="id">Id del progetto da aggiornare.</param>
    /// <param name="request">Nuovi dati del progetto.</param>
    [Authorize]
    [HttpPut]
    [Route("/api/projects/{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Models.Project request)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null)
            return NotFound(new { status = "error", message = "Progetto non trovato" });

        var slug = string.IsNullOrWhiteSpace(request.Slug)
            ? Slugify(request.Title)
            : request.Slug;

        var slugConflict = await _context.Projects.AnyAsync(p => p.Slug == slug && p.Id != id);
        if (slugConflict)
            return Conflict(new { status = "error", message = "Slug già in uso" });

        project.Title = request.Title;
        project.Slug = slug;
        project.Client = request.Client;
        project.Services = request.Services;
        project.Description = request.Description;
        project.CoverImage = request.CoverImage;
        project.GalleryImages = request.GalleryImages;
        project.LayoutType = request.LayoutType;
        project.ProjectDate = request.ProjectDate;

        await _context.SaveChangesAsync();
        return Ok(new { status = "success", data = project });
    }

    /// <summary>
    /// DELETE /api/projects/{id} — Elimina definitivamente un progetto. Richiede JWT.
    /// Restituisce 404 se il progetto non esiste.
    /// </summary>
    /// <param name="id">Id del progetto da eliminare.</param>
    [Authorize]
    [HttpDelete]
    [Route("/api/projects/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null)
            return NotFound(new { status = "error", message = "Progetto non trovato" });

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
        return Ok(new { status = "success", message = "Progetto eliminato" });
    }

    /// <summary>
    /// Normalizza una stringa in uno slug URL-friendly (minuscolo, solo alfanumerici e trattini).
    /// Gestisce le lettere accentate italiane (à, è, ì, ò, ù).
    /// </summary>
    /// <param name="text">Testo da convertire in slug (tipicamente il titolo del progetto).</param>
    private static string Slugify(string text)
    {
        text = text.ToLowerInvariant().Trim();
        text = Regex.Replace(text, @"[àáâãäå]", "a");
        text = Regex.Replace(text, @"[èéêë]", "e");
        text = Regex.Replace(text, @"[ìíîï]", "i");
        text = Regex.Replace(text, @"[òóôõö]", "o");
        text = Regex.Replace(text, @"[ùúûü]", "u");
        text = Regex.Replace(text, @"[^a-z0-9\s-]", "");
        text = Regex.Replace(text, @"\s+", "-");
        return text;
    }

    /// <summary>
    /// Deserializza il campo GalleryImages da stringa JSON a array di oggetti.
    /// Restituisce un array vuoto in caso di JSON malformato o campo nullo.
    /// </summary>
    /// <param name="json">Stringa JSON contenente le immagini della galleria.</param>
    private object[] ParseGalleryImages(string json)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(json)) return Array.Empty<object>();
            return JsonSerializer.Deserialize<object[]>(json) ?? Array.Empty<object>();
        }
        catch
        {
            return Array.Empty<object>();
        }
    }
}
