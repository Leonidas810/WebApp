using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WebApp.Server.Data;
using WebApp.Server.WebSockets;
using MySocketManager = WebApp.Server.WebSockets.WebSocketManager;


DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION")
    ?? throw new InvalidOperationException("DB_CONNECTION not found in environment variables.");

builder.Services.AddDbContext<WebAppServerContext>(options =>
    options.UseNpgsql(connectionString));

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddSingleton<MySocketManager>();
builder.Services.AddSingleton<WebSocketHandler>();


var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();
app.UseWebSockets();

app.Use(async (context, next) =>
{
    Console.WriteLine($"Request path: {context.Request.Path}");
    if (context.Request.Path == "/ws" && context.WebSockets.IsWebSocketRequest)
    {
        Console.WriteLine("WebSocket connection requested");
        var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        var handler = app.Services.GetRequiredService<WebSocketHandler>();
        await handler.HandleAsync(webSocket);
    }
    else
    {
        await next();
    }
});


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
