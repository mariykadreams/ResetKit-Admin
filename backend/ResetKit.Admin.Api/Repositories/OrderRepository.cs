using System.Globalization;
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
        {
            var start = CombineDateAndTime(query.DateFrom.Value.Date, query.TimeFrom, endOfDay: false);
            q = q.Where(o => o.CreatedAt >= start);
        }

        if (query.DateTo.HasValue)
        {
            var end = CombineDateAndTime(query.DateTo.Value.Date, query.TimeTo, endOfDay: true);
            q = q.Where(o => o.CreatedAt <= end);
        }

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

    /// <summary>
    /// Combines date with optional time string (HH:mm or HH:mm:ss).
    /// If endOfDay and no time: returns end of that day (23:59:59.999).
    /// If time provided: returns date + time (inclusive).
    /// </summary>
    private static DateTime CombineDateAndTime(DateTime date, string? time, bool endOfDay)
    {
        if (!string.IsNullOrWhiteSpace(time) && TimeSpan.TryParse(time, CultureInfo.InvariantCulture, out var ts))
            return date.Add(ts);
        return endOfDay ? date.Date.AddDays(1).AddTicks(-1) : date.Date;
    }
}
