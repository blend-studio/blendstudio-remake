using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace backend.Controllers;

[ApiController]
[Authorize]
[Route("api/admin/users")]
public class AdminUsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminUsersController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/admin/users
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _context.Users
            .OrderBy(u => u.CreatedAt)
            .Select(u => new { u.Id, u.Email, u.CreatedAt })
            .ToListAsync();

        return Ok(new { status = "success", data = users });
    }

    // POST /api/admin/users
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { status = "error", message = "Email e password sono obbligatori" });

        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest(new { status = "error", message = "Email già registrata" });

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { status = "success", data = new { user.Id, user.Email, user.CreatedAt } });
    }

    // PATCH /api/admin/users/{id}/password
    [HttpPatch("{id:int}/password")]
    public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { status = "error", message = "Password obbligatoria" });

        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(new { status = "error", message = "Utente non trovato" });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        await _context.SaveChangesAsync();

        return Ok(new { status = "success", message = "Password aggiornata" });
    }

    // DELETE /api/admin/users/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        if (id == currentUserId)
            return BadRequest(new { status = "error", message = "Non puoi eliminare il tuo stesso account" });

        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(new { status = "error", message = "Utente non trovato" });

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { status = "success", message = "Utente eliminato" });
    }
}
