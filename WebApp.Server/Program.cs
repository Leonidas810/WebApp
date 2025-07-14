using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WebApp.Server.Data;
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


var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

//Enable WebSockets
app.UseWebSockets();

var socketManager = new MySocketManager();

app.Map("/ws", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        var socket = await context.WebSockets.AcceptWebSocketAsync();
        var id = Guid.NewGuid().ToString();

        socketManager.AddSocket(id, socket);

        await socketManager.ReceiveAsync(id, socket);
    }
    else
    {
        context.Response.StatusCode = 400;
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
