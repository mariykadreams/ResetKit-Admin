namespace ResetKit.Admin.Api.Dtos;

/// <summary>
/// DTO returned after CSV import.
/// </summary>
public class ImportOrdersResponse
{
    public int ImportedCount { get; set; }
    public IReadOnlyList<string> Errors { get; set; } = Array.Empty<string>();
}
