using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

/// <summary>
/// Gestisce le impostazioni amministrative (firma email, ecc.).
/// Tutti gli endpoint richiedono autenticazione JWT.
/// </summary>
[ApiController]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public SettingsController(IWebHostEnvironment env)
    {
        _env = env;
    }

    private string SignaturePath => Path.Combine(_env.ContentRootPath, "uploads", "signature.html");

    /// <summary>
    /// GET /api/admin/settings/signature — Restituisce l'HTML della firma email salvata.
    /// Se non esiste ancora nessuna firma, restituisce content vuoto.
    /// </summary>
    [HttpGet("/api/admin/settings/signature")]
    public IActionResult GetSignature()
    {
        if (!System.IO.File.Exists(SignaturePath))
            return Ok(new { content = string.Empty });

        var content = System.IO.File.ReadAllText(SignaturePath);
        return Ok(new { content });
    }

    /// <summary>
    /// POST /api/admin/settings/signature — Carica un file .html come firma email.
    /// Il file viene salvato in uploads/signature.html e il suo contenuto viene restituito.
    /// </summary>
    /// <param name="file">File HTML della firma.</param>
    [HttpPost("/api/admin/settings/signature")]
    public async Task<IActionResult> UploadSignature(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { status = "error", message = "File mancante" });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext != ".html" && ext != ".htm")
            return BadRequest(new { status = "error", message = "Formato non supportato. Carica un file .html o .htm" });

        var dir = Path.GetDirectoryName(SignaturePath)!;
        Directory.CreateDirectory(dir);

        await using (var stream = new FileStream(SignaturePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var content = await System.IO.File.ReadAllTextAsync(SignaturePath);
        return Ok(new { status = "success", content });
    }
}
