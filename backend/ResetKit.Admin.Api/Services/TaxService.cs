using System.Globalization;
using System.Text.Json;

namespace ResetKit.Admin.Api.Services;

/// <summary>
/// Tax calculation based on reverse geocoding (US Census Geocoder) and
/// NYS Publication 718 combined rates by jurisdiction.
/// </summary>
public class TaxService : ITaxService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<TaxService> _logger;

    // Publication 718 provides a combined rate. We derive components:
    // state = 4% and MCTD special = 0.375% (when applicable). Remaining = local.
    private const decimal StateRate = 0.04m;
    private const decimal MctdRate = 0.00375m;

    public TaxService(IHttpClientFactory httpClientFactory, ILogger<TaxService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<TaxCalculationResult> CalculateTaxAsync(
        decimal latitude,
        decimal longitude,
        decimal subtotal,
        CancellationToken ct = default)
    {
        // 1. Reverse geocode coordinates → state/county/city/ZIP (ZCTA) using US Census Geocoder
        var geo = await ReverseGeocodeCensusAsync(latitude, longitude, ct);

        // 2. Resolve combined rate by jurisdiction (Publication 718)
        NyPub718Rates.TryResolve(geo.County, geo.City, out var entry);

        // 3. Compute composite tax and amounts
        var compositeRate = entry.CompositeRate;
        var specialRate = entry.includesMctd ? MctdRate : 0m;
        var localRate = Math.Max(0m, compositeRate - StateRate - specialRate);
        var taxAmount = Math.Round(subtotal * compositeRate, 2);
        var totalAmount = subtotal + taxAmount;

        return new TaxCalculationResult
        {
            LocationState = geo.State,
            LocationCounty = geo.County,
            LocationCity = geo.City,
            LocationZip = geo.Zip,
            LocationDistrict = geo.District,
            LocationSource = "US Census Geocoder",
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
    }

    /// <summary>
    /// Calls United States Census Bureau reverse geocoding API.
    /// </summary>
    private async Task<CensusGeo> ReverseGeocodeCensusAsync(
        decimal latitude,
        decimal longitude,
        CancellationToken ct)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            var latStr = latitude.ToString(CultureInfo.InvariantCulture);
            var lonStr = longitude.ToString(CultureInfo.InvariantCulture);

            var url = "https://geocoding.geo.census.gov/geocoder/geographies/coordinates" +
                      $"?x={lonStr}&y={latStr}&benchmark=Public_AR_Current&vintage=Current_Current&format=json";

            var response = await client.GetAsync(url, ct);
            response.EnsureSuccessStatusCode();

            await using var stream = await response.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            return ParseCensusGeographies(doc);
        }
        catch (Exception ex) when (!ct.IsCancellationRequested)
        {
            _logger.LogWarning(ex, "Census reverse geocoding failed for lat={Lat}, lon={Lon}", latitude, longitude);
            return new CensusGeo();
        }
    }

    private static CensusGeo ParseCensusGeographies(JsonDocument doc)
    {
        // Response shape:
        // { result: { geographies: { Counties:[{NAME}], "Incorporated Places":[{NAME}], "Census ZIP Code Tabulation Areas":[{ZCTA5}], ... } } }
        if (!doc.RootElement.TryGetProperty("result", out var result) ||
            !result.TryGetProperty("geographies", out var geos))
            return new CensusGeo();

        string? GetName(string key)
        {
            if (!geos.TryGetProperty(key, out var arr) || arr.ValueKind != JsonValueKind.Array || arr.GetArrayLength() == 0)
                return null;
            var first = arr[0];
            return first.TryGetProperty("NAME", out var name) ? name.GetString() : null;
        }

        string? GetZip()
        {
            const string key = "Census ZIP Code Tabulation Areas";
            if (!geos.TryGetProperty(key, out var arr) || arr.ValueKind != JsonValueKind.Array || arr.GetArrayLength() == 0)
                return null;
            var first = arr[0];
            if (first.TryGetProperty("ZCTA5", out var zcta)) return zcta.GetString();
            if (first.TryGetProperty("NAME", out var name)) return name.GetString();
            return null;
        }

        var state = GetName("States");
        var county = GetName("Counties");
        var city = GetName("Incorporated Places") ?? GetName("County Subdivisions");
        var zip = GetZip();
        var district = GetName("Census Blocks") ?? GetName("Census Tracts");

        return new CensusGeo
        {
            State = state,
            County = county,
            City = city,
            Zip = zip,
            District = district
        };
    }

    private sealed class CensusGeo
    {
        public string? State { get; init; }
        public string? County { get; init; }
        public string? City { get; init; }
        public string? Zip { get; init; }
        public string? District { get; init; }
    }
}

