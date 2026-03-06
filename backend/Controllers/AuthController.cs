using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers;

/// <summary>
/// Gestisce l'autenticazione degli utenti tramite JWT.
/// Espone login, logout e verifica token per il pannello admin.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    /// <summary>
    /// POST /api/login — Verifica le credenziali e restituisce un JWT valido 7 giorni.
    /// </summary>
    /// <param name="request">Email e password dell'utente.</param>
    [HttpPost]
    [Route("/api/login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { status = "error", message = "Dati mancanti" });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { status = "error", message = "Credenziali non valide" });

        var token = GenerateJwt(user.Id, user.Email);

        return Ok(new
        {
            status = "success",
            message = "Login effettuato",
            token,
            user = new { id = user.Id, email = user.Email }
        });
    }

    /// <summary>
    /// GET /api/check-auth — Verifica che il JWT nel header Authorization sia valido.
    /// Restituisce id e email dell'utente autenticato.
    /// </summary>
    [Authorize]
    [HttpGet]
    [Route("/api/check-auth")]
    public IActionResult CheckAuth()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        return Ok(new { status = "authenticated", user = new { id = userId, email } });
    }

    /// <summary>
    /// POST /api/logout — Con JWT il logout è stateless: il client elimina il token localmente.
    /// Questo endpoint esiste per uniformità con le API REST.
    /// </summary>
    [HttpPost]
    [Route("/api/logout")]
    public IActionResult Logout()
    {
        // Con JWT il logout è gestito lato client rimuovendo il token
        return Ok(new { status = "success", message = "Logout effettuato" });
    }

    /// <summary>
    /// Genera un JWT firmato con HS256, valido 7 giorni.
    /// Inserisce come claim: NameIdentifier (userId) e Email.
    /// </summary>
    /// <param name="userId">Id numerico dell'utente da includere nel token.</param>
    /// <param name="email">Email dell'utente da includere nel token.</param>
    private string GenerateJwt(int userId, string email)
    {
        var secret = _config["JWT_SECRET"] ?? "super_secret_key_blend_studio_2024_make_it_longer_later";
        var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
        };

        var token = new JwtSecurityToken(
            issuer: _config["JWT_ISSUER"] ?? "blendstudio-api",
            audience: _config["JWT_AUDIENCE"] ?? "blendstudio-frontend",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
