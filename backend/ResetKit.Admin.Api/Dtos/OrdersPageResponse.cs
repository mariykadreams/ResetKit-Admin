namespace ResetKit.Admin.Api.Dtos;

/// <summary>
/// Paginated response for GET /orders.
/// </summary>
public class OrdersPageResponse
{
    public IReadOnlyList<OrderResponse> Data { get; set; } = Array.Empty<OrderResponse>();
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}
