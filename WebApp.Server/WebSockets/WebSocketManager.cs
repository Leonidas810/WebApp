using System.Net.WebSockets;
using System.Text;

namespace WebApp.Server.WebSockets;

public class WebSocketManager
{
    private readonly Dictionary<string, WebSocket> _sockets = new();

    public void AddSocket(string id, WebSocket socket)
    {
        _sockets[id] = socket;
        Console.WriteLine($"Socket connected: {id}");
    }

    public void RemoveSocket(string id)
    {
        if (_sockets.Remove(id))
        {
            Console.WriteLine($"Socket disconnected: {id}");
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
                    var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    Console.WriteLine($"Received from {id}: {message}");
                    await BroadcastMessageAsync(message, excludeId: id);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error with socket {id}: {ex.Message}");
            RemoveSocket(id);
        }
    }

    public async Task SendMessageAsync(string id, string message)
    {
        if (_sockets.TryGetValue(id, out var socket) && socket.State == WebSocketState.Open)
        {
            var buffer = Encoding.UTF8.GetBytes(message);
            await socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
        }
    }

    public async Task BroadcastMessageAsync(string message, string? excludeId = null)
    {
        var buffer = Encoding.UTF8.GetBytes(message);

        var otherSockets = _sockets.Where(pair => pair.Key != excludeId && pair.Value.State == WebSocketState.Open).ToList();

        if (otherSockets.Count == 0 && excludeId != null && _sockets.TryGetValue(excludeId, out var onlyClientSocket))
        {
            if (onlyClientSocket.State == WebSocketState.Open)
            {
                var onlyOneMsg = Encoding.UTF8.GetBytes("onlyOneClient");
                await onlyClientSocket.SendAsync(onlyOneMsg, WebSocketMessageType.Text, true, CancellationToken.None);
            }
            return;
        }

        foreach (var pair in _sockets)
        {
            if (pair.Key == excludeId) continue;

            var socket = pair.Value;
            if (socket.State == WebSocketState.Open)
            {
                await socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }
    }



    public IEnumerable<string> GetAllSocketIds() => _sockets.Keys;
}
