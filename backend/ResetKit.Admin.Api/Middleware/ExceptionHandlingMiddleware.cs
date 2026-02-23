using System.Net;
using System.Text.Json;

namespace ResetKit.Admin.Api.Middleware;

/// <summary>
/// Global exception handler. Returns consistent JSON error responses.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var (statusCode, message) = ex switch
        {
            ArgumentException arg => (HttpStatusCode.BadRequest, arg.Message),
            InvalidOperationException inv => (HttpStatusCode.BadRequest, inv.Message),
            _ => (HttpStatusCode.InternalServerError, _env.IsDevelopment() ? ex.ToString() : "An error occurred.")
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var body = new { message, traceId = context.TraceIdentifier };
        await context.Response.WriteAsync(JsonSerializer.Serialize(body));
    }
}
