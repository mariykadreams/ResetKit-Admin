namespace ResetKit.Admin.Api.Services;

/// <summary>
/// Tax calculation based on local geolocation (NY cities dataset) and
/// NYS Publication 718 combined rates by jurisdiction.
/// </summary>
public class TaxService : ITaxService
{
    private readonly IGeoLocationService _geoLocationService;
    private readonly ILogger<TaxService> _logger;

    // Publication 718 provides a combined rate. We derive components:
    // state = 4% and MCTD special = 0.375% (when applicable). Remaining = local.
    private const decimal StateRate = 0.04m;
    private const decimal MctdRate = 0.00375m;

    public TaxService(IGeoLocationService geoLocationService, ILogger<TaxService> logger)
    {
        _geoLocationService = geoLocationService;
        _logger = logger;
    }

    public Task<TaxCalculationResult> CalculateTaxAsync(
        decimal latitude,
        decimal longitude,
        decimal subtotal,
        CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        // 1. Resolve city/county from coordinates using local NY dataset (no external API)
        var geo = _geoLocationService.GetLocationFromCoordinates(latitude, longitude);

        // 2. Resolve combined rate by jurisdiction (Publication 718)
        NyPub718Rates.TryResolve(geo.County, geo.City, out var entry);

        // 3. Compute composite tax and amounts
        var compositeRate = entry.CompositeRate;
        var specialRate = entry.includesMctd ? MctdRate : 0m;
        var localRate = Math.Max(0m, compositeRate - StateRate - specialRate);
        var taxAmount = Math.Round(subtotal * compositeRate, 2);
        var totalAmount = subtotal + taxAmount;

        var result = new TaxCalculationResult
        {
            LocationState = geo.State,
            LocationCounty = geo.County,
            LocationCity = geo.City,
            LocationZip = null, // Local dataset does not include ZIP
            LocationDistrict = null,
            LocationSource = "Local NY Dataset",
            LocationReportingCode = entry.ReportingCode,
            StateRate = StateRate,
            CountyRate = localRate, // treated as "local" bucket (Publication 718 is combined)
            CityRate = 0m,
            SpecialRate = specialRate,
            CompositeTaxRate = compositeRate,
            TaxAmount = taxAmount,
            TotalAmount = totalAmount,
            Jurisdictions = $"{entry.JurisdictionName} (code {entry.ReportingCode}, effective {NyPub718Rates.EffectiveDate:yyyy-MM-dd})"
        };

        return Task.FromResult(result);
    }
}
