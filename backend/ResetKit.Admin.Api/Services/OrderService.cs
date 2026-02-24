using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;
using System.Text;
using ResetKit.Admin.Api.Domain;
using ResetKit.Admin.Api.Dtos;
using ResetKit.Admin.Api.Repositories;

namespace ResetKit.Admin.Api.Services;

public class OrderService : IOrderService
{
    private sealed class CsvOrderRowMap : ClassMap<CsvOrderRow>
    {
        public CsvOrderRowMap()
        {
            Map(m => m.Latitude).Name("latitude");
            Map(m => m.Longitude).Name("longitude");
            Map(m => m.Subtotal).Name("subtotal");
            Map(m => m.Timestamp).Name("timestamp");
        }
    }
    private readonly IOrderRepository _orderRepo;
    private readonly ITaxService _taxService;

    public OrderService(IOrderRepository orderRepo, ITaxService taxService)
    {
        _orderRepo = orderRepo;
        _taxService = taxService;
    }

    public async Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, CancellationToken ct = default)
    {
        var result = await _taxService.CalculateTaxAsync(request.Latitude, request.Longitude, request.Subtotal, ct);

        var order = new Order
        {
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Subtotal = request.Subtotal,
            CompositeTaxRate = result.CompositeTaxRate,
            TaxAmount = result.TaxAmount,
            TotalAmount = result.TotalAmount,
            StateRate = result.StateRate,
            CountyRate = result.CountyRate,
            CityRate = result.CityRate,
            SpecialRate = result.SpecialRate,
            Jurisdictions = result.Jurisdictions,
            CreatedAt = DateTime.UtcNow
        };

        order = await _orderRepo.AddAsync(order, ct);
        var response = MapToResponse(order);
        response.LocationState = result.LocationState;
        response.LocationCounty = result.LocationCounty;
        response.LocationCity = result.LocationCity;
        response.LocationZip = result.LocationZip;
        response.LocationDistrict = result.LocationDistrict;
        response.LocationSource = result.LocationSource;
        response.LocationReportingCode = result.LocationReportingCode;
        return response;
    }

    public async Task<OrdersPageResponse> GetOrdersAsync(OrdersQueryRequest query, CancellationToken ct = default)
    {
        var page = await _orderRepo.GetPageAsync(query, ct);
        return new OrdersPageResponse
        {
            Data = page.Items.Select(MapToResponse).ToList(),
            TotalCount = page.TotalCount,
            TotalPages = (int)Math.Ceiling(page.TotalCount / (double)query.PageSize)
        };
    }

    public async Task<ImportOrdersResponse> ImportFromCsvAsync(Stream csvStream, CancellationToken ct = default)
    {
        var errors = new List<string>();
        var importedCount = 0;

        var delimiter = DetectDelimiter(csvStream);
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            Delimiter = delimiter,
            HasHeaderRecord = true,
            TrimOptions = TrimOptions.Trim,
            MissingFieldFound = null,
            BadDataFound = null,
            HeaderValidated = null
        };

        if (csvStream.CanSeek)
            csvStream.Position = 0;
        using var reader = new StreamReader(csvStream, Encoding.UTF8);
        using var csv = new CsvReader(reader, config);
        csv.Context.RegisterClassMap<CsvOrderRowMap>();

        IAsyncEnumerable<CsvOrderRow> records = csv.GetRecordsAsync<CsvOrderRow>(ct);

        try
        {
        await foreach (var row in records.WithCancellation(ct))
        {
            if (!decimal.TryParse(row.Latitude, NumberStyles.Any, CultureInfo.InvariantCulture, out var lat) ||
                !decimal.TryParse(row.Longitude, NumberStyles.Any, CultureInfo.InvariantCulture, out var lng) ||
                !decimal.TryParse(row.Subtotal, NumberStyles.Any, CultureInfo.InvariantCulture, out var subtotal))
            {
                errors.Add($"Invalid row: lat={row.Latitude}, lng={row.Longitude}, subtotal={row.Subtotal}");
                continue;
            }

            if (lat < -90 || lat > 90 || lng < -180 || lng > 180 || subtotal <= 0)
            {
                errors.Add($"Invalid values: lat={lat}, lng={lng}, subtotal={subtotal}");
                continue;
            }

            try
            {
                var result = await _taxService.CalculateTaxAsync(lat, lng, subtotal, ct);

                var order = new Order
                {
                    Latitude = lat,
                    Longitude = lng,
                    Subtotal = subtotal,
                    CompositeTaxRate = result.CompositeTaxRate,
                    TaxAmount = result.TaxAmount,
                    TotalAmount = result.TotalAmount,
                    StateRate = result.StateRate,
                    CountyRate = result.CountyRate,
                    CityRate = result.CityRate,
                    SpecialRate = result.SpecialRate,
                    Jurisdictions = result.Jurisdictions,
                    CreatedAt = ParseTimestamp(row.Timestamp) ?? DateTime.UtcNow
                };

                await _orderRepo.AddAsync(order, ct);
                importedCount++;
            }
            catch (Exception ex)
            {
                errors.Add($"Row error: {ex.Message}");
            }
        }
        }
        catch (Exception ex)
        {
            errors.Add($"CSV parse error: {ex.Message}");
        }

        return new ImportOrdersResponse { ImportedCount = importedCount, Errors = errors };
    }

    private static string DetectDelimiter(Stream stream)
    {
        var start = stream.Position;
        using var reader = new StreamReader(stream, Encoding.UTF8, leaveOpen: true);
        var firstLine = reader.ReadLine();
        stream.Position = start;
        if (string.IsNullOrEmpty(firstLine)) return ",";
        return firstLine.Contains('\t') ? "\t" : ",";
    }

    private static DateTime? ParseTimestamp(string? s)
    {
        if (string.IsNullOrWhiteSpace(s)) return null;
        return DateTime.TryParse(s, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt)
            ? dt
            : null;
    }

    private static OrderResponse MapToResponse(Order o) => new()
    {
        Id = o.Id,
        Latitude = o.Latitude,
        Longitude = o.Longitude,
        Subtotal = o.Subtotal,
        CompositeTaxRate = o.CompositeTaxRate,
        TaxAmount = o.TaxAmount,
        TotalAmount = o.TotalAmount,
        StateRate = o.StateRate,
        CountyRate = o.CountyRate,
        CityRate = o.CityRate,
        SpecialRate = o.SpecialRate,
        Jurisdictions = o.Jurisdictions,
        CreatedAt = o.CreatedAt
    };

    private class CsvOrderRow
    {
        public string Latitude { get; set; } = string.Empty;
        public string Longitude { get; set; } = string.Empty;
        public string Subtotal { get; set; } = string.Empty;
        public string? Timestamp { get; set; }
    }
}
