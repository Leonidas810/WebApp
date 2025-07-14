using System.Net.WebSockets;
using System.Text;

namespace WebApp.Server.WebSockets;

public class WebSocketManager
{
    private readonly Dictionary<string, WebSocket> _sockets = new();

    public void AddSocket(string id, WebSocket socket)
    {
        _sockets[id] = socket;
    }

    public async Task SendMessageAsync(string id, string message)
    {
        if (_sockets.TryGetValue(id, out var socket) && socket.State == WebSocketState.Open)
        {
            var buffer = Encoding.UTF8.GetBytes(message);
            await socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
        }
    }
}
