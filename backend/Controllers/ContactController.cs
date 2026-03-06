using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

/// <summary>
/// Gestisce le richieste di contatto pubbliche e l'amministrazione dei messaggi ricevuti.
/// Gli endpoint pubblici non richiedono autenticazione; quelli admin richiedono JWT.
/// </summary>
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

    /// <summary>
    /// POST /api/contact — Salva il messaggio nel database e invia una notifica email all'admin.
    /// Non richiede autenticazione. Restituisce 400 se email o testo sono vuoti.
    /// </summary>
    /// <param name="request">Dati del form di contatto (nome, email, testo, telefono opzionale).</param>
    [HttpPost]
    // Consente chiamate anche a /api/contact per compatibilità totale
    [Route("/api/contact")]
    public async Task<IActionResult> Submit([FromBody] Message request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.MessageText))
        {
            return BadRequest(new { status = "error", message = "Dati mancanti" });
        }

        try
        {
            request.Id = 0;
            request.CreatedAt = DateTime.UtcNow;
            request.IsRead = false;

            _context.Messages.Add(request);
            await _context.SaveChangesAsync();

            var adminEmail = _config["SMTP_USER"];
            var subject = $"Nuovo contatto da Blend Studio: {request.Name}";
            var body = $@"
                <h3>Hai ricevuto un nuovo messaggio</h3>
                <p><strong>Nome:</strong> {request.Name}</p>
                <p><strong>Email:</strong> {request.Email}</p>
                <p><strong>Telefono:</strong> {request.Phone ?? "N/A"}</p>
                <p><strong>Messaggio:</strong><br>{request.MessageText}</p>
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

    // ── Admin endpoints ────────────────────────────────────────────────────

    /// <summary>
    /// GET /api/admin/messages — Restituisce tutti i messaggi in ordine cronologico decrescente.
    /// </summary>
    [Authorize]
    [HttpGet]
    [Route("/api/admin/messages")]
    public async Task<IActionResult> GetMessages()
    {
        var messages = await _context.Messages
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
        return Ok(new { status = "success", data = messages });
    }

    /// <summary>
    /// PATCH /api/admin/messages/{id}/read — Segna il messaggio come letto (IsRead = true).
    /// </summary>
    /// <param name="id">Id del messaggio da marcare come letto.</param>
    [Authorize]
    [HttpPatch]
    [Route("/api/admin/messages/{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var msg = await _context.Messages.FindAsync(id);
        if (msg == null) return NotFound(new { status = "error", message = "Messaggio non trovato" });
        msg.IsRead = true;
        await _context.SaveChangesAsync();
        return Ok(new { status = "success" });
    }

    /// <summary>
    /// DELETE /api/admin/messages/{id} — Elimina definitivamente un messaggio.
    /// </summary>
    /// <param name="id">Id del messaggio da eliminare.</param>
    [Authorize]
    [HttpDelete]
    [Route("/api/admin/messages/{id:int}")]
    public async Task<IActionResult> DeleteMessage(int id)
    {
        var msg = await _context.Messages.FindAsync(id);
        if (msg == null) return NotFound(new { status = "error", message = "Messaggio non trovato" });
        _context.Messages.Remove(msg);
        await _context.SaveChangesAsync();
        return Ok(new { status = "success", message = "Messaggio eliminato" });
    }

    /// <summary>
    /// POST /api/admin/messages/{id}/reply — Invia una risposta email al mittente del messaggio.
    /// Supporta destinatari multipli, CC e BCC. Segna automaticamente il messaggio come letto.
    /// </summary>
    /// <param name="id">Id del messaggio a cui rispondere.</param>
    /// <param name="request">Dati della risposta: body HTML, To extra, CC, BCC.</param>
    [Authorize]
    [HttpPost]
    [Route("/api/admin/messages/{id:int}/reply")]
    public async Task<IActionResult> Reply(int id, [FromBody] ReplyRequest request)
    {
        var msg = await _context.Messages.FindAsync(id);
        if (msg == null) return NotFound(new { status = "error", message = "Messaggio non trovato" });
        if (string.IsNullOrWhiteSpace(request.Body))
            return BadRequest(new { status = "error", message = "Testo risposta mancante" });

        /* Costruisce la lista destinatari: mittente originale + eventuali To extra */
        var toList = new List<string> { msg.Email };
        toList.AddRange(request.To.Where(e => !string.IsNullOrWhiteSpace(e) && e != msg.Email));

        var subject = "Re: Il tuo messaggio a Blend Studio";

        var sent = await _mailer.SendEmailAsync(
            toEmails: toList,
            subject:  subject,
            bodyHtml: request.Body,
            cc:  request.Cc.Where(e => !string.IsNullOrWhiteSpace(e)).ToList(),
            bcc: request.Bcc.Where(e => !string.IsNullOrWhiteSpace(e)).ToList());

        if (!sent) return StatusCode(500, new { status = "error", message = "Invio email fallito" });

        msg.IsRead = true;
        await _context.SaveChangesAsync();

        return Ok(new { status = "success", message = "Risposta inviata" });
    }
}
