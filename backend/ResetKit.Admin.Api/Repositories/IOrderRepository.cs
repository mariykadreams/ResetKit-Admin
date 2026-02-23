using ResetKit.Admin.Api.Domain;
using ResetKit.Admin.Api.Dtos;

namespace ResetKit.Admin.Api.Repositories;

/// <summary>
/// Repository abstraction for Order data access.
/// Keeps business logic out of data layer.
/// </summary>
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Order> AddAsync(Order order, CancellationToken ct = default);
    Task<OrdersPage> GetPageAsync(OrdersQueryRequest query, CancellationToken ct = default);
}

public record OrdersPage(IReadOnlyList<Order> Items, int TotalCount);
