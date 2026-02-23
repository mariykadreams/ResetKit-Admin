using Microsoft.EntityFrameworkCore;
using ResetKit.Admin.Api.Data;
using ResetKit.Admin.Api.Domain;
using ResetKit.Admin.Api.Dtos;

namespace ResetKit.Admin.Api.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _db;

    public OrderRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Order?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await _db.Orders.FindAsync(new object[] { id }, ct);
    }

    public async Task<Order> AddAsync(Order order, CancellationToken ct = default)
    {
        _db.Orders.Add(order);
        await _db.SaveChangesAsync(ct);
        return order;
    }

    public async Task<OrdersPage> GetPageAsync(OrdersQueryRequest query, CancellationToken ct = default)
    {
        var q = _db.Orders.AsNoTracking();

        if (query.DateFrom.HasValue)
            q = q.Where(o => o.CreatedAt >= query.DateFrom.Value);

        if (query.DateTo.HasValue)
            q = q.Where(o => o.CreatedAt <= query.DateTo.Value);

        if (query.MinTotalAmount.HasValue)
            q = q.Where(o => o.TotalAmount >= query.MinTotalAmount.Value);

        if (query.MaxTotalAmount.HasValue)
            q = q.Where(o => o.TotalAmount <= query.MaxTotalAmount.Value);

        var totalCount = await q.CountAsync(ct);

        var sortBy = query.SortBy?.ToLowerInvariant() ?? "createdat";
        var desc = string.Equals(query.SortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        var ordered = sortBy switch
        {
            "id" => desc ? q.OrderByDescending(o => o.Id) : q.OrderBy(o => o.Id),
            "subtotal" => desc ? q.OrderByDescending(o => o.Subtotal) : q.OrderBy(o => o.Subtotal),
            "totalamount" => desc ? q.OrderByDescending(o => o.TotalAmount) : q.OrderBy(o => o.TotalAmount),
            _ => desc ? q.OrderByDescending(o => o.CreatedAt) : q.OrderBy(o => o.CreatedAt)
        };

        var skip = (query.Page - 1) * query.PageSize;
        var items = await ordered
            .Skip(skip)
            .Take(query.PageSize)
            .ToListAsync(ct);

        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);

        return new OrdersPage(items, totalCount);
    }
}
