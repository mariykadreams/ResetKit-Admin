using Microsoft.AspNetCore.Mvc;
using ResetKit.Admin.Api.Dtos;
using ResetKit.Admin.Api.Services;

namespace ResetKit.Admin.Api.Controllers;

/// <summary>
/// Orders API. Controllers are kept thin; business logic lives in OrderService.
/// </summary>
[ApiController]
[Route("orders")]
[Produces("application/json")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    /// <summary>
    /// Import historical orders from CSV (latitude, longitude, subtotal, timestamp).
    /// </summary>
    [HttpPost("import")]
    [ProducesResponseType(typeof(ImportOrdersResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ImportOrdersResponse>> ImportOrders(IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        if (!string.Equals(Path.GetExtension(file.FileName), ".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "File must be a CSV." });

        await using var stream = file.OpenReadStream();
        var result = await _orderService.ImportFromCsvAsync(stream, ct);
        return Ok(result);
    }

    /// <summary>
    /// Manually create a new order. Tax is calculated immediately.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(OrderResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<OrderResponse>> CreateOrder([FromBody] CreateOrderRequest request, CancellationToken ct)
    {
        if (request == null)
            return BadRequest(new { message = "Request body is required." });

        var order = await _orderService.CreateOrderAsync(request, ct);
        return Created($"/orders?id={order.Id}", order);
    }

    /// <summary>
    /// Get paginated, filterable list of orders.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(OrdersPageResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<OrdersPageResponse>> GetOrders(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null,
        [FromQuery] string? timeFrom = null,
        [FromQuery] string? timeTo = null,
        [FromQuery] decimal? minTotalAmount = null,
        [FromQuery] decimal? maxTotalAmount = null,
        [FromQuery] string sortBy = "CreatedAt",
        [FromQuery] string sortDirection = "desc",
        CancellationToken ct = default)
    {
        var query = new OrdersQueryRequest
        {
            Page = page,
            PageSize = pageSize,
            DateFrom = dateFrom,
            DateTo = dateTo,
            TimeFrom = timeFrom,
            TimeTo = timeTo,
            MinTotalAmount = minTotalAmount,
            MaxTotalAmount = maxTotalAmount,
            SortBy = sortBy,
            SortDirection = sortDirection
        };

        var result = await _orderService.GetOrdersAsync(query, ct);
        return Ok(result);
    }
}
