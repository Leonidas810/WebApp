using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using Microsoft.Extensions.DependencyInjection;
using WebApp.Server.Data;

DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION")
    ?? throw new InvalidOperationException("DB_CONNECTION not found in environment variables.");

builder.Services.AddDbContext<WebAppServerContext>(options =>
    options.UseNpgsql(connectionString));

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
