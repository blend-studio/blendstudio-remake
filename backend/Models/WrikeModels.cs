using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models
{
    // ══════════════════════════════════════════
    //  MONGODB DOCUMENTS
    // ══════════════════════════════════════════

    /// <summary>
    /// Snapshot di un task Wrike salvato in MongoDB (collection "wrike_tasks").
    ///
    /// Struttura JSON in Mongo:
    /// {
    ///   "taskId":            "IEABC1234",
    ///   "title":             "Design Homepage Banner",
    ///   "status":            "Active",          // Active | Completed | Deferred | Cancelled
    ///   "importance":        "High",             // Low | Normal | High
    ///   "projectId":         "PRJXYZ",
    ///   "projectName":       "Sito Web Cliente X",
    ///   "assigneeIds":       ["USER_A", "USER_B"],
    ///   "authorId":          "USER_C",
    ///   "createdDate":       ISODate("2026-01-10"),
    ///   "startDate":         ISODate("2026-02-01"),
    ///   "dueDate":           ISODate("2026-02-28"),
    ///   "completedDate":     null,
    ///   "estimatedMinutes":  1440,
    ///   "spentMinutes":      480,
    ///   "commentCount":      7,
    ///   "attachmentCount":   2,
    ///   "permalink":         "https://wrike.com/...",
    ///   "daysInCurrentStatus": 4,
    ///   "statusChangedAt":   ISODate("2026-03-02"),
    ///   "isDelayed":         false,
    ///   "delayDays":         0,
    ///   "riskScore":         null,               // popolato dal microservizio Python
    ///   "lastSyncAt":        ISODate("2026-03-06")
    /// }
    /// </summary>
    public class WrikeTaskSnapshot
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

        [BsonElement("taskId")]
        public string TaskId { get; set; } = string.Empty;

        [BsonElement("title")]
        public string Title { get; set; } = string.Empty;

        [BsonElement("status")]
        public string Status { get; set; } = string.Empty;

        [BsonElement("importance")]
        public string Importance { get; set; } = "Normal";

        [BsonElement("projectId")]
        public string? ProjectId { get; set; }

        [BsonElement("projectName")]
        public string? ProjectName { get; set; }

        [BsonElement("assigneeIds")]
        public List<string> AssigneeIds { get; set; } = new();

        [BsonElement("authorId")]
        public string? AuthorId { get; set; }

        [BsonElement("createdDate")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime? CreatedDate { get; set; }

        [BsonElement("startDate")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime? StartDate { get; set; }

        [BsonElement("dueDate")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime? DueDate { get; set; }

        [BsonElement("completedDate")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime? CompletedDate { get; set; }

        [BsonElement("estimatedMinutes")]
        public int? EstimatedMinutes { get; set; }

        [BsonElement("spentMinutes")]
        public int? SpentMinutes { get; set; }

        [BsonElement("commentCount")]
        public int CommentCount { get; set; }

        [BsonElement("attachmentCount")]
        public int AttachmentCount { get; set; }

        [BsonElement("permalink")]
        public string? Permalink { get; set; }

        [BsonElement("daysInCurrentStatus")]
        public int DaysInCurrentStatus { get; set; }

        [BsonElement("statusChangedAt")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime? StatusChangedAt { get; set; }

        /// <summary>true se dueDate è passata e il task non è ancora completato.</summary>
        [BsonElement("isDelayed")]
        public bool IsDelayed { get; set; }

        /// <summary>Giorni di ritardo (positivo = in ritardo, negativo = consegnato prima).</summary>
        [BsonElement("delayDays")]
        public int? DelayDays { get; set; }

        /// <summary>Punteggio di rischio [0-1] calcolato dal microservizio Python/ML.</summary>
        [BsonElement("riskScore")]
        public double? RiskScore { get; set; }

        [BsonElement("lastSyncAt")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime LastSyncAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Membro del team Wrike salvato in "wrike_contacts".
    /// </summary>
    public class WrikeContact
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

        [BsonElement("contactId")]
        public string ContactId { get; set; } = string.Empty;

        [BsonElement("firstName")]
        public string FirstName { get; set; } = string.Empty;

        [BsonElement("lastName")]
        public string LastName { get; set; } = string.Empty;

        [BsonElement("email")]
        public string? Email { get; set; }

        [BsonElement("type")]
        public string Type { get; set; } = "Person";

        [BsonElement("lastSyncAt")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime LastSyncAt { get; set; } = DateTime.UtcNow;
    }

    // ══════════════════════════════════════════
    //  WRIKE API RESPONSE DTOs
    //
    //  Queste classi mappano 1:1 la struttura JSON restituita da
    //  https://www.wrike.com/api/v4. I nomi delle proprietà sono in
    //  PascalCase ma la deserializzazione usa PropertyNameCaseInsensitive=true
    //  in JsonSerializerOptions, quindi il matching con il JSON camelCase
    //  di Wrike avviene automaticamente.
    // ══════════════════════════════════════════

    /// <summary>
    /// Wrapper comune di tutte le risposte Wrike API v4.
    /// Ogni endpoint restituisce { "kind": "tasks", "data": [...] }.
    /// </summary>
    public class WrikeApiResponse<T>
    {
        public string Kind { get; set; } = string.Empty;
        public List<T> Data { get; set; } = new();
    }

    /// <summary>
    /// Task Wrike così come restituito dall'API /tasks.
    /// Nota: ResponsibleIds contiene gli assegnatari ("responsibili"),
    /// che nella nostra convenzione MongoDB vengono rinominati AssigneeIds.
    /// AuthorIds è sempre una lista anche se in Wrike ogni task ha un solo autore.
    /// </summary>
    public class WrikeApiTask
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Importance { get; set; } = "Normal";
        /// <summary>Cartelle dirette che contengono il task.</summary>
        public List<string> ParentIds { get; set; } = new();
        /// <summary>Progetti-radice: in Wrike i task vivono in folder gerarchiche.
        /// Il primo SuperParentId corrisponde al progetto di livello più alto.</summary>
        public List<string> SuperParentIds { get; set; } = new();
        /// <summary>Assegnatari del task (API li chiama "responsible").</summary>
        public List<string> ResponsibleIds { get; set; } = new();
        /// <summary>Lista di 1 elemento: l'utente che ha creato il task.</summary>
        public List<string> AuthorIds { get; set; } = new();
        public string? CreatedDate { get; set; }
        public string? UpdatedDate { get; set; }
        /// <summary>Null se il task non è ancora completato.</summary>
        public string? CompletedDate { get; set; }
        /// <summary>Date di inizio e scadenza, incluse solo se il task ha pianificazione.</summary>
        public WrikeApiTaskDates? Dates { get; set; }
        public int CommentCount { get; set; }
        public int AttachmentCount { get; set; }
        public string? Permalink { get; set; }
        /// <summary>Stima e ore effettive (richiede il campo "effortAllocation" nella query).</summary>
        public WrikeApiEffortAllocation? EffortAllocation { get; set; }
    }

    /// <summary>
    /// Pianificazione temporale del task.
    /// Type può essere: "Backlog" (nessuna data), "Milestone", "Planned".
    /// Duration è espresso in minuti dall'API Wrike.
    /// </summary>
    public class WrikeApiTaskDates
    {
        public string Type { get; set; } = string.Empty;
        /// <summary>Durata in minuti (non in giorni).</summary>
        public int? Duration { get; set; }
        /// <summary>Formato ISO 8601: "2026-03-01T00:00:00Z"</summary>
        public string? Start { get; set; }
        /// <summary>Formato ISO 8601: "2026-03-31T00:00:00Z"</summary>
        public string? Due { get; set; }
    }

    /// <summary>
    /// Allocazione dello sforzo stimato vs effettivo.
    /// TotalEffort = preventivo in minuti.
    /// AllocatedEffort = ore registrate/registrate finora.
    /// </summary>
    public class WrikeApiEffortAllocation
    {
        public string Status { get; set; } = string.Empty;
        public int? TotalEffort { get; set; }
        public int? AllocatedEffort { get; set; }
        public string? Mode { get; set; }
    }

    /// <summary>
    /// Membro del team restituito da GET /contacts.
    /// Type = "Person" per utenti reali; "Group" per team virtuali (ignorati al sync).
    /// </summary>
    public class WrikeApiContact
    {
        public string Id { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Profiles { get; set; }
        public string Type { get; set; } = "Person";
    }

    public class WrikeApiFolder
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Project { get; set; }
    }

    // ══════════════════════════════════════════
    //  DASHBOARD VIEW MODELS (risposta API)
    //
    //  Questi record sono i DTO restituiti da WrikeController agli endpoint
    //  consumati dal frontend React. Usiamo C# record per immutabilità
    //  e costruzione compatta (primary constructor = meno boilerplate).
    // ══════════════════════════════════════════

    /// <summary>KPI aggregati per la dashboard principale.</summary>
    public record WrikeDashboardDto(
        int ActiveTasksCount,
        int CompletedTasksCount,
        /// <summary>Task attivi con dueDate già superata.</summary>
        int DelayedTasksCount,
        /// <summary>Task messi in pausa manualmente dall'utente in Wrike.</summary>
        int DeferredTasksCount,
        double AvgDaysInCurrentStatus,
        List<WrikeStatusBreakdownDto> ByStatus,
        List<WrikeImportanceBreakdownDto> ByImportance
    );

    /// <summary>Quanti task si trovano in ogni status.</summary>
    public record WrikeStatusBreakdownDto(string Status, int Count);

    /// <summary>Distribuzione priorità (High/Normal/Low) tra i task attivi.</summary>
    public record WrikeImportanceBreakdownDto(string Importance, int Count);

    /// <summary>
    /// Carico di lavoro di un singolo membro del team.
    /// Tasks è la lista dettagliata dei task aperti assegnati a questa persona.
    /// </summary>
    public record WrikeWorkloadDto(
        string AssigneeId,
        string AssigneeName,
        int TotalTasks,
        int HighPriorityTasks,
        int DelayedTasks,
        List<WrikeTaskSummaryDto> Tasks
    );

    /// <summary>
    /// Sommario di un task usato nelle liste (workload + bottlenecks).
    /// RiskScore è null finché il microservizio Python non ha eseguito l'inferenza.
    /// </summary>
    public record WrikeTaskSummaryDto(
        string TaskId,
        string Title,
        string Status,
        string Importance,
        DateTime? DueDate,
        bool IsDelayed,
        int DaysInCurrentStatus,
        double? RiskScore,
        string? Permalink
    );

    /// <summary>
    /// Task bloccato restituito dall'endpoint /bottlenecks.
    /// Include i nomi già risolti (AssigneeNames) per evitare
    /// un secondo round-trip dal frontend.
    /// </summary>
    public record WrikeBottleneckDto(
        string TaskId,
        string Title,
        string Status,
        string Importance,
        int DaysInCurrentStatus,
        List<string> AssigneeIds,
        List<string> AssigneeNames,
        DateTime? DueDate,
        string? Permalink
    );
}
