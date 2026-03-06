namespace backend.Models;

/// <summary>Payload per la risposta a un messaggio di contatto.</summary>
public class ReplyRequest
{
    /// <summary>Corpo HTML della risposta.</summary>
    public string Body { get; set; } = string.Empty;
    /// <summary>Destinatari aggiuntivi (oltre al mittente originale).</summary>
    public List<string> To  { get; set; } = [];
    /// <summary>Indirizzi in copia (CC).</summary>
    public List<string> Cc  { get; set; } = [];
    /// <summary>Indirizzi in copia nascosta (BCC).</summary>
    public List<string> Bcc { get; set; } = [];
}
