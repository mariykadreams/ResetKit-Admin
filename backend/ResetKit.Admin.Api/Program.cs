using Microsoft.EntityFrameworkCore;
using ResetKit.Admin.Api.Data;
using ResetKit.Admin.Api.Middleware;
using ResetKit.Admin.Api.Repositories;
using ResetKit.Admin.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "ResetKit Admin API", Version = "v1" });
});

builder.Services.AddDbContext<AppDbContext>(opts =>
{
    var conn = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Server=(localdb)\\mssqllocaldb;Database=ResetKitAdmin;Trusted_Connection=True;TrustServerCertificate=True;";
    opts.UseSqlServer(conn);
});

// DI: Repositories and Services
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<ITaxService, TaxService>();
builder.Services.AddScoped<IOrderService, OrderService>();

// CORS
builder.Services.AddCors(opts =>
{
    opts.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// Middleware pipeline
app.UseExceptionHandling();
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "ResetKit Admin API v1"));
app.UseCors();
app.UseAuthorization();
app.MapControllers();

// Apply migrations at startup (ensure database is ready)
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Failed to apply migrations. Ensure SQL Server is running.");
    }
}

await app.RunAsync();
