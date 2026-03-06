using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

/// <summary>
/// Gestisce l'upload di immagini per i progetti (cover e gallery).
/// Richiede autenticazione JWT. Max 500 KB per file.
/// I file vengono serviti staticamente da /uploads/images/.
/// </summary>
[ApiController]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"];
    private const long MaxFileSizeBytes = 500 * 1024; // 500 KB

    public UploadController(IWebHostEnvironment env)
    {
        _env = env;
    }

    private string UploadsDir => Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, "uploads", "images");

    /// <summary>
    /// POST /api/admin/upload/image — Carica un'immagine (max 500 KB).
    /// Restituisce l'URL pubblico del file caricato.
    /// </summary>
    [HttpPost("/api/admin/upload/image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { status = "error", message = "File mancante." });

        if (file.Length > MaxFileSizeBytes)
            return BadRequest(new { status = "error", message = "Il file supera i 500 KB consentiti." });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            return BadRequest(new { status = "error", message = $"Formato non supportato. Usa: {string.Join(", ", AllowedExtensions)}" });

        Directory.CreateDirectory(UploadsDir);

        // Genera nome univoco per evitare collisioni
        var fileName = $"{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(UploadsDir, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // URL pubblico accessibile dal frontend
        var publicUrl = $"{Request.Scheme}://{Request.Host}/uploads/images/{fileName}";

        return Ok(new { status = "success", url = publicUrl, file_name = fileName });
    }

    /// <summary>
    /// DELETE /api/admin/upload/image/{fileName} — Rimuove un'immagine caricata.
    /// </summary>
    [HttpDelete("/api/admin/upload/image/{fileName}")]
    public IActionResult DeleteImage(string fileName)
    {
        // Sanity check: niente path traversal
        if (fileName.Contains('/') || fileName.Contains('\\') || fileName.Contains(".."))
            return BadRequest(new { status = "error", message = "Nome file non valido." });

        var filePath = Path.Combine(UploadsDir, fileName);
        if (!System.IO.File.Exists(filePath))
            return NotFound(new { status = "error", message = "File non trovato." });

        System.IO.File.Delete(filePath);
        return Ok(new { status = "success" });
    }
}
