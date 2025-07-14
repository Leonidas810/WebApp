using System.Net.WebSockets;
using System.Text;

namespace WebApp.Server.WebSockets;

public class WebSocketHandler
{
    private readonly WebSocketManager _manager;

    public WebSocketHandler(WebSocketManager manager)
    {
        _manager = manager;
    }

    public async Task HandleAsync(WebSocket socket)
    {
        string clientId = Guid.NewGuid().ToString();
        _manager.AddSocket(clientId, socket);

        var buffer = new byte[1024 * 4];
        while (socket.State == WebSocketState.Open)
        {
            var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            var message = Encoding.UTF8.GetString(buffer, 0, result.Count);

            // ✅ Mostrar en consola el mensaje recibido
            Console.WriteLine($"[WebSocket] Mensaje recibido: {message}");

            // Aquí procesas el mensaje según quien lo envió
            if (message.Contains("triggerWindow"))
            {
                Console.WriteLine("[WebSocket] Acción: abrir ventana en WinForms");
                await _manager.SendMessageAsync("winforms-client-id", "openWindow");
            }
        }
    }

}
