using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

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
