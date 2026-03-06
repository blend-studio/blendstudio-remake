using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace backend.Services;

public interface IMailerService
{
    /// <summary>Invia un'email con supporto a destinatari multipli, CC e BCC.</summary>
    Task<bool> SendEmailAsync(
        IEnumerable<string> toEmails,
        string subject,
        string bodyHtml,
        IEnumerable<string>? cc  = null,
        IEnumerable<string>? bcc = null);

    /// <summary>Overload convenienza a singolo destinatario.</summary>
    Task<bool> SendEmailAsync(string toEmail, string subject, string bodyHtml)
        => SendEmailAsync(new[] { toEmail }, subject, bodyHtml);
}

public class MailerService : IMailerService
{
    private readonly IConfiguration _config;

    public MailerService(IConfiguration config)
    {
        _config = config;
    }

    public async Task<bool> SendEmailAsync(
        IEnumerable<string> toEmails,
        string subject,
        string bodyHtml,
        IEnumerable<string>? cc  = null,
        IEnumerable<string>? bcc = null)
    {
        try
        {
            var host      = _config["SMTP_HOST"];
            var port      = int.Parse(_config["SMTP_PORT"] ?? "587");
            var user      = _config["SMTP_USER"];
            var pass      = _config["SMTP_PASS"];
            var fromEmail = _config["SMTP_FROM_EMAIL"];
            var fromName  = _config["SMTP_FROM_NAME"];

            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(user, pass),
                EnableSsl   = _config["SMTP_SECURE"]?.ToLower() is "tls" or "ssl"
            };

            var mail = new MailMessage
            {
                From       = new MailAddress(fromEmail!, fromName),
                Subject    = subject,
                Body       = bodyHtml,
                IsBodyHtml = true
            };

            foreach (var to in toEmails)
                mail.To.Add(to);

            if (cc  != null) foreach (var addr in cc)  mail.CC.Add(addr);
            if (bcc != null) foreach (var addr in bcc) mail.Bcc.Add(addr);

            await client.SendMailAsync(mail);
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Errore Mailer: {ex.Message}");
            return false;
        }
    }
}
