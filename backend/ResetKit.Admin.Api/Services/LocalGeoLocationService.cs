using System.Globalization;
using System.Reflection;
using CsvHelper;
using CsvHelper.Configuration;

namespace ResetKit.Admin.Api.Services;

/// <summary>
/// Local geolocation lookup using embedded NY cities dataset. Uses Haversine formula
/// to find the nearest city. No external API calls.
/// </summary>
public sealed class LocalGeoLocationService : IGeoLocationService
{
    private readonly IReadOnlyList<CityRecord> _cities;
    private readonly ILogger<LocalGeoLocationService> _logger;

    // New York State approximate bounding box (decimal degrees WGS84)
    private const decimal NyMinLat = 40.4m;
    private const decimal NyMaxLat = 45.1m;
    private const decimal NyMinLon = -79.8m;
    private const decimal NyMaxLon = -71.7m;

    private const double EarthRadiusKm = 6371.0;

    public LocalGeoLocationService(ILogger<LocalGeoLocationService> logger)
    {
        _logger = logger;
        _cities = LoadCities();
        _logger.LogInformation("Loaded {Count} NY cities for local geolocation", _cities.Count);
    }

    public GeoLocationResult GetLocationFromCoordinates(decimal latitude, decimal longitude)
    {
        if (latitude < NyMinLat || latitude > NyMaxLat || longitude < NyMinLon || longitude > NyMaxLon)
        {
            _logger.LogWarning("Coordinates outside NY: lat={Lat}, lon={Lon}", latitude, longitude);
            throw new InvalidOperationException(
                "Coordinates are outside New York State. Tax calculation is only supported for addresses within New York.");
        }

        var nearest = FindNearestCity(latitude, longitude);
        if (nearest == null)
        {
            throw new InvalidOperationException(
                "Could not resolve location from coordinates. No matching city found in NY dataset.");
        }

        return new GeoLocationResult(nearest.StateName, nearest.County, nearest.City);
    }

    private CityRecord? FindNearestCity(decimal lat, decimal lon)
    {
        if (_cities.Count == 0) return null;

        double minDist = double.MaxValue;
        CityRecord? nearest = null;

        var latD = (double)lat;
        var lonD = (double)lon;

        foreach (var c in _cities)
        {
            var dist = HaversineKm(latD, lonD, c.Lat, c.Lon);
            if (dist < minDist)
            {
                minDist = dist;
                nearest = c;
            }
        }

        return nearest;
    }

    private static double HaversineKm(double lat1, double lon1, double lat2, double lon2)
    {
        var phi1 = lat1 * Math.PI / 180.0;
        var phi2 = lat2 * Math.PI / 180.0;
        var dPhi = (lat2 - lat1) * Math.PI / 180.0;
        var dLambda = (lon2 - lon1) * Math.PI / 180.0;

        var a = Math.Sin(dPhi / 2) * Math.Sin(dPhi / 2) +
                Math.Cos(phi1) * Math.Cos(phi2) +
                Math.Sin(dLambda / 2) * Math.Sin(dLambda / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return EarthRadiusKm * c;
    }

    private static IReadOnlyList<CityRecord> LoadCities()
    {
        var baseDir = AppContext.BaseDirectory;
        var path = Path.Combine(baseDir, "Data", "ny_cities.csv");

        if (!File.Exists(path))
        {
            // Fallback: try next to assembly
            var assemblyDir = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location) ?? baseDir;
            path = Path.Combine(assemblyDir, "Data", "ny_cities.csv");
        }

        if (!File.Exists(path))
        {
            throw new InvalidOperationException(
                $"NY cities dataset not found at {path}. Ensure ny_cities.csv is in the Data folder and copied to output.");
        }

        using var reader = new StreamReader(path);
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            TrimOptions = TrimOptions.Trim,
            MissingFieldFound = null,
            BadDataFound = null
        };

        using var csv = new CsvReader(reader, config);
        csv.Context.RegisterClassMap<CityRecordMap>();
        var records = csv.GetRecords<CityRecord>().ToList();
        return records;
    }

    private sealed class CityRecord
    {
        public string StateCode { get; set; } = string.Empty;
        public string StateName { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string County { get; set; } = string.Empty;
        public double Lat { get; set; }
        public double Lon { get; set; }
    }

    private sealed class CityRecordMap : ClassMap<CityRecord>
    {
        public CityRecordMap()
        {
            Map(m => m.StateCode).Name("STATE_CODE");
            Map(m => m.StateName).Name("STATE_NAME");
            Map(m => m.City).Name("CITY");
            Map(m => m.County).Name("COUNTY");
            Map(m => m.Lat).Name("LATITUDE");
            Map(m => m.Lon).Name("LONGITUDE");
        }
    }
}
