using ResetKit.Admin.Api.Dtos;

namespace ResetKit.Admin.Api.Services;

public interface IOrderService
{
    Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, CancellationToken ct = default);
    Task<OrdersPageResponse> GetOrdersAsync(OrdersQueryRequest query, CancellationToken ct = default);
    Task<ImportOrdersResponse> ImportFromCsvAsync(Stream csvStream, CancellationToken ct = default, Guid? progressId = null);
}
