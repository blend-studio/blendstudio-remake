using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace backend.Services;

public interface IMailerService
{
    Task<bool> SendEmailAsync(string toEmail, string subject, string bodyHtml);
}

public class MailerService : IMailerService
{
    private readonly IConfiguration _config;

    public MailerService(IConfiguration config)
    {
        _config = config;
    }

    public async Task<bool> SendEmailAsync(string toEmail, string subject, string bodyHtml)
    {
        try
        {
            var host = _config["SMTP_HOST"];
            var port = int.Parse(_config["SMTP_PORT"] ?? "587");
            var user = _config["SMTP_USER"];
            var pass = _config["SMTP_PASS"];
            var fromEmail = _config["SMTP_FROM_EMAIL"];
            var fromName = _config["SMTP_FROM_NAME"];

            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(user, pass),
                EnableSsl = _config["SMTP_SECURE"]?.ToLower() == "tls" || _config["SMTP_SECURE"]?.ToLower() == "ssl"
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail!, fromName),
                Subject = subject,
                Body = bodyHtml,
                IsBodyHtml = true
            };
            
            mailMessage.To.Add(toEmail);

            await client.SendMailAsync(mailMessage);
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Errore Mailer: {ex.Message}");
            return false;
        }
    }
}
