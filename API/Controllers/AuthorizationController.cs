using System.Text.RegularExpressions;
using API.Data;
using API.Dtos;
using API.Entity;
using API.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;


[ApiController]
[Route("api/[controller]")]
public class AuthorizationController : ControllerBase
{
    private readonly IUserRepository _repo;
    private readonly JwtService _jwtService;

    public AuthorizationController(IUserRepository repo, JwtService jwtService)
    {
        _repo = repo;
        _jwtService = jwtService;
    }
    
    [HttpPost("registration")]
    public IActionResult Register(RegisterDto dto)
    {
        var existingUser = _repo.GetByName(dto.Name);
        if (existingUser != null)
        {
            return Conflict(new { message = "Username is already taken" });
        }
        
        var validPasswordRegex = new Regex("^[A-Za-z]+$");
        if (!validPasswordRegex.IsMatch(dto.Password))
        {
            return BadRequest(new { message = "Password should contain only letters A-Z" });
        }

        var user = new User()
        {
            Name = dto.Name,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _repo.CreateUser(user);
        return Created("success", user);
    }



    [HttpPost("login")]
    public IActionResult Login(LoginDto dto)
    {
        var user = _repo.GetByName(dto.Name);

        if (user == null) return BadRequest(new { message = "Invalid Credentials" });
        
        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
        {
            return BadRequest(new {message = "Invalid Credentials"});
        }

        var jwt = _jwtService.Generate(user.Id);

        Response.Cookies.Append("jwt", jwt, new CookieOptions
        {
            HttpOnly = true
        });

        return Ok(new
        {
            message = "success"
        });
    }
    
    [HttpGet("user")]
    public IActionResult GetUser()
    {
        try
        {
            var jwt = Request.Cookies["jwt"];

            var token = _jwtService.Verify(jwt);

            int userId = int.Parse(token.Issuer);

            var user = _repo.GetById(userId);

            return Ok(user);
        }
        catch (Exception)
        {
            return Unauthorized();
        }
    }
    
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("jwt");

        return Ok(new
        {
            message = "success"
        });
    }
}