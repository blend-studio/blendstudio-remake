using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMailerService _mailer;
    private readonly IConfiguration _config;

    public ContactController(AppDbContext context, IMailerService mailer, IConfiguration config)
    {
        _context = context;
        _mailer = mailer;
        _config = config;
    }

    public class ContactRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    [HttpPost]
    // Consente chiamate anche a /api/contact per compatibilità totale
    [Route("/api/contact")]
    public async Task<IActionResult> Submit([FromBody] ContactRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { status = "error", message = "Dati mancanti" });
        }

        try
        {
            var message = new Message
            {
                Name = request.Name,
                Email = request.Email,
                Phone = request.Phone,
                MessageText = request.Message,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            var adminEmail = _config["SMTP_USER"]; // Oppure una mail specifica
            var subject = $"Nuovo contatto da Blend Studio: {request.Name}";
            var body = $@"
                <h3>Hai ricevuto un nuovo messaggio</h3>
                <p><strong>Nome:</strong> {request.Name}</p>
                <p><strong>Email:</strong> {request.Email}</p>
                <p><strong>Telefono:</strong> {request.Phone ?? "N/A"}</p>
                <p><strong>Messaggio:</strong><br>{request.Message}</p>
            ";

            var mailSent = await _mailer.SendEmailAsync(adminEmail!, subject, body);

            return Ok(new
            {
                status = "success",
                message = "Messaggio ricevuto",
                mail_sent = mailSent
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Errore salvataggio contatto: {ex.Message}");
            return StatusCode(500, new { status = "error", message = "Errore server" });
        }
    }
}
