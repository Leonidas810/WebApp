using Microsoft.CodeAnalysis;
using Microsoft.Extensions.DependencyInjection;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using WebApp.Server.Data;
using WebApp.Server.Models;
using WebApp.Server.WebSockets;


namespace WebApp.Server.WebSockets;

public class WebSocketManager
{
    private readonly Dictionary<string, WebSocket> _sockets = new();
    private readonly IServiceProvider _serviceProvider;

    public WebSocketManager(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async void AddSocket(string id, WebSocket socket)
    {
        _sockets[id] = socket;
        var responseObj = new
        {
            Instruction = "connectAck",
            Plataform="Server",
            id = id
        };
        string messageJson = JsonSerializer.Serialize(responseObj);
        await SendMessageAsync(id, messageJson);
        Console.WriteLine($"[Server]: Socket connected: {id}");
    }

    public void RemoveSocket(string id)
    {
        if (_sockets.Remove(id))
        {
            Console.WriteLine($"[Server]: Socket disconnected: {id}");
        }
    }

    public async Task ReceiveAsync(string id, WebSocket socket)
    {
        var buffer = new byte[1024 * 4];
        try
        {
            while (socket.State == WebSocketState.Open)
            {
                var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed by server", CancellationToken.None);
                    RemoveSocket(id);
                }
                else if (result.MessageType == WebSocketMessageType.Text)
                {
                    var messageJson = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    Console.WriteLine($"[Server]: Received raw from {id}: {messageJson}");

                    WebSocketMessage message;
                    try
                    {
                        message = JsonSerializer.Deserialize<WebSocketMessage>(messageJson);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[Server]: Error deserializing message from {id}: {ex.Message}");
                        continue;
                    }

                    Console.WriteLine($"[Server]: Parsed instruction: {message.Instruction}, origin: {message.OriginId}, platform: {message.Platform}");


                    using var scope = _serviceProvider.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<WebAppServerContext>();

                    var record = new Records
                    {
                        Platform = message.Platform,
                        Action = message.Instruction,
                        dateTime = DateTime.UtcNow
                    };

                     dbContext.Records.Add(record);
                     await dbContext.SaveChangesAsync();
                    
                    await BroadcastMessageAsync(messageJson, excludeId: id);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Server]: Error with socket {id}: {ex.Message}");
            RemoveSocket(id);
        }
    }


    public async Task SendMessageAsync(string id, string message)
    {
        if (_sockets.TryGetValue(id, out var socket) && socket.State == WebSocketState.Open)
        {
            var buffer = Encoding.UTF8.GetBytes(message);
            var segment = new ArraySegment<byte>(buffer);
            await socket.SendAsync(segment, WebSocketMessageType.Text, true, CancellationToken.None);
        }
    }

    public async Task BroadcastMessageAsync(string messageJson, string? excludeId = null)
    {
        var openSockets = _sockets
            .Where(pair => pair.Key != excludeId && pair.Value.State == WebSocketState.Open)
            .ToList();

        // Caso especial: solo un cliente conectado (el excluido)
        if (openSockets.Count == 0 && excludeId != null &&
            _sockets.TryGetValue(excludeId, out var onlyClientSocket) &&
            onlyClientSocket.State == WebSocketState.Open)
        {
            var onlyOneMessage = new
            {
                instruction = "onlyOneClient",
                originId = excludeId,
                platform = "server"
            };

            string json = JsonSerializer.Serialize(onlyOneMessage);
            await SendMessageAsync(excludeId, json);
            return;
        }

        // Enviar a todos los demás
        foreach (var pair in openSockets)
        {
            await SendMessageAsync(pair.Key, messageJson);
        }
    }}
