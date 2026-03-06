namespace backend.Models;

public class TelemetryEvent
{
    public string? Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Page { get; set; } = string.Empty;
    public string? ElementId { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
    public DateTime Timestamp { get; set; }
    public string? SessionId { get; set; }

    // Enrichment fields set by the frontend hook
    public string? Referrer { get; set; }
    public string? UserAgent { get; set; }
    public string? Language { get; set; }
    public int? ScreenW { get; set; }
    public int? ScreenH { get; set; }
}
