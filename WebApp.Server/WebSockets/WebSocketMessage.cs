namespace WebApp.Server.WebSockets;

public class WebSocketMessage
{
    public string Instruction { get; set; }
    public string OriginId { get; set; }
    public string Platform { get; set; }

    public string Message { get; set; }
}
