namespace ResetKit.Admin.Api.Dtos;

/// <summary>
/// DTO representing real-time progress of a CSV import.
/// </summary>
public class ImportOrdersProgressResponse
{
    public Guid ProgressId { get; set; }
    public int TotalRows { get; set; }
    public int ProcessedRows { get; set; }
    public int ImportedCount { get; set; }
    public int ErrorCount { get; set; }
    public bool Completed { get; set; }
}

