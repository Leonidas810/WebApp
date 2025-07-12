

namespace WebApp.Server.Models;
public class Records {
    public int Id { get; set; }
    public string Platform { get; set; } = string.Empty;

    public string Action {  get; set; } = string.Empty;

    public DateTime dateTime { get; set; }
}