using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProjectController(AppDbContext context)
    {
        _context = context;
    }

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
