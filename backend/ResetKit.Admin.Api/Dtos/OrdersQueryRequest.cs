using System.ComponentModel.DataAnnotations;

namespace ResetKit.Admin.Api.Dtos;

/// <summary>
/// Query parameters for filtering and paginating orders.
/// </summary>
public class OrdersQueryRequest
{
    [Range(1, 100)]
    public int Page { get; set; } = 1;

    [Range(1, 100)]
    public int PageSize { get; set; } = 20;

    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    /// <summary>Optional time for DateFrom, format HH:mm or HH:mm:ss.</summary>
    public string? TimeFrom { get; set; }
    /// <summary>Optional time for DateTo, format HH:mm or HH:mm:ss. Inclusive of this time.</summary>
    public string? TimeTo { get; set; }
    public decimal? MinTotalAmount { get; set; }
    public decimal? MaxTotalAmount { get; set; }

    /// <summary>Sort field: Id, Subtotal, TotalAmount, CreatedAt. Default: CreatedAt.</summary>
    public string SortBy { get; set; } = "CreatedAt";

    /// <summary>asc or desc. Default: desc.</summary>
    public string SortDirection { get; set; } = "desc";
}
