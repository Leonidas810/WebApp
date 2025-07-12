using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WebApp.Server.Data;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<WebAppServerContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("WebAppServerContext") ?? throw new InvalidOperationException("Connection string 'WebAppServerContext' not found.")));

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
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
