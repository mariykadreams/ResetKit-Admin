namespace ResetKit.Admin.Api.Services;

/// <summary>
/// NYS Publication 718 combined (state + local + any special) sales tax rates by jurisdiction.
/// Effective March 1, 2025 (Publication 718(2/25)).
/// </summary>
public static class NyPub718Rates
{
    public static readonly DateOnly EffectiveDate = new(2025, 3, 1);

    public sealed record Entry(
        string JurisdictionName,
        decimal CompositeRate,
        string ReportingCode,
        bool includesMctd);

    private static decimal Pct(decimal percent) => percent / 100m;

    // County-level entries (when a county has "except" cities, this is the county entry).
    private static readonly IReadOnlyDictionary<string, Entry> County = new Dictionary<string, Entry>(StringComparer.OrdinalIgnoreCase)
    {
        ["New York State"] = new("New York State", Pct(4.0m), "0021", includesMctd: false),

        ["Albany"] = new("Albany", Pct(8.0m), "0181", includesMctd: false),
        ["Allegany"] = new("Allegany", Pct(8.5m), "0221", includesMctd: false),
        ["Broome"] = new("Broome", Pct(8.0m), "0321", includesMctd: false),
        ["Cattaraugus"] = new("Cattaraugus", Pct(8.0m), "0481", includesMctd: false),
        ["Cayuga"] = new("Cayuga", Pct(8.0m), "0511", includesMctd: false),
        ["Chautauqua"] = new("Chautauqua", Pct(8.0m), "0651", includesMctd: false),
        ["Chemung"] = new("Chemung", Pct(8.0m), "0711", includesMctd: false),
        ["Chenango"] = new("Chenango", Pct(8.0m), "0861", includesMctd: false),
        ["Clinton"] = new("Clinton", Pct(8.0m), "0921", includesMctd: false),
        ["Columbia"] = new("Columbia", Pct(8.0m), "1021", includesMctd: false),
        ["Cortland"] = new("Cortland", Pct(8.0m), "1131", includesMctd: false),
        ["Delaware"] = new("Delaware", Pct(8.0m), "1221", includesMctd: false),
        ["Dutchess"] = new("Dutchess", Pct(8.125m), "1311", includesMctd: true),
        ["Erie"] = new("Erie", Pct(8.75m), "1451", includesMctd: false),
        ["Essex"] = new("Essex", Pct(8.0m), "1521", includesMctd: false),
        ["Franklin"] = new("Franklin", Pct(8.0m), "1621", includesMctd: false),
        ["Fulton"] = new("Fulton", Pct(8.0m), "1791", includesMctd: false),
        ["Genesee"] = new("Genesee", Pct(8.0m), "1811", includesMctd: false),
        ["Greene"] = new("Greene", Pct(8.0m), "1911", includesMctd: false),
        ["Hamilton"] = new("Hamilton", Pct(8.0m), "2011", includesMctd: false),
        ["Herkimer"] = new("Herkimer", Pct(8.25m), "2121", includesMctd: false),
        ["Jefferson"] = new("Jefferson", Pct(8.0m), "2221", includesMctd: false),
        ["Lewis"] = new("Lewis", Pct(8.0m), "2321", includesMctd: false),
        ["Livingston"] = new("Livingston", Pct(8.0m), "2411", includesMctd: false),
        ["Madison"] = new("Madison", Pct(8.0m), "2511", includesMctd: false),
        ["Monroe"] = new("Monroe", Pct(8.0m), "2611", includesMctd: false),
        ["Montgomery"] = new("Montgomery", Pct(8.0m), "2781", includesMctd: false),
        ["Nassau"] = new("Nassau", Pct(8.625m), "2811", includesMctd: true),
        ["Niagara"] = new("Niagara", Pct(8.0m), "2911", includesMctd: false),
        ["Oneida"] = new("Oneida", Pct(8.75m), "3010", includesMctd: false),
        ["Onondaga"] = new("Onondaga", Pct(8.0m), "3121", includesMctd: false),
        ["Ontario"] = new("Ontario", Pct(7.5m), "3211", includesMctd: false),
        ["Orange"] = new("Orange", Pct(8.125m), "3321", includesMctd: true),
        ["Orleans"] = new("Orleans", Pct(8.0m), "3481", includesMctd: false),
        ["Oswego"] = new("Oswego", Pct(8.0m), "3501", includesMctd: false),
        ["Otsego"] = new("Otsego", Pct(8.0m), "3621", includesMctd: false),
        ["Putnam"] = new("Putnam", Pct(8.375m), "3731", includesMctd: true),
        ["Rensselaer"] = new("Rensselaer", Pct(8.0m), "3881", includesMctd: false),
        ["Rockland"] = new("Rockland", Pct(8.375m), "3921", includesMctd: true),
        ["St. Lawrence"] = new("St. Lawrence", Pct(8.0m), "4091", includesMctd: false),
        ["Saratoga"] = new("Saratoga", Pct(7.0m), "4111", includesMctd: false),
        ["Schenectady"] = new("Schenectady", Pct(8.0m), "4241", includesMctd: false),
        ["Schoharie"] = new("Schoharie", Pct(8.0m), "4321", includesMctd: false),
        ["Schuyler"] = new("Schuyler", Pct(8.0m), "4411", includesMctd: false),
        ["Seneca"] = new("Seneca", Pct(8.0m), "4511", includesMctd: false),
        ["Steuben"] = new("Steuben", Pct(8.0m), "4691", includesMctd: false),
        ["Suffolk"] = new("Suffolk", Pct(8.75m), "4711", includesMctd: true),
        ["Sullivan"] = new("Sullivan", Pct(8.0m), "4821", includesMctd: false),
        ["Tioga"] = new("Tioga", Pct(8.0m), "4921", includesMctd: false),
        ["Tompkins"] = new("Tompkins", Pct(8.0m), "5081", includesMctd: false),
        ["Ulster"] = new("Ulster", Pct(8.0m), "5111", includesMctd: false),
        ["Warren"] = new("Warren", Pct(7.0m), "5281", includesMctd: false),
        ["Washington"] = new("Washington", Pct(7.0m), "5311", includesMctd: false),
        ["Wayne"] = new("Wayne", Pct(8.0m), "5421", includesMctd: false),
        ["Westchester"] = new("Westchester", Pct(8.375m), "5581", includesMctd: true),
        ["Wyoming"] = new("Wyoming", Pct(8.0m), "5621", includesMctd: false),
        ["Yates"] = new("Yates", Pct(8.0m), "5721", includesMctd: false),
    };

    // City-level overrides for specific counties (Publication 718 "except" cities).
    private static readonly IReadOnlyDictionary<string, Entry> City = new Dictionary<string, Entry>(StringComparer.OrdinalIgnoreCase)
    {
        ["Cattaraugus|Olean"] = new("Olean (city)", Pct(8.0m), "0441", includesMctd: false),
        ["Cattaraugus|Salamanca"] = new("Salamanca (city)", Pct(8.0m), "0431", includesMctd: false),
        ["Cayuga|Auburn"] = new("Auburn (city)", Pct(8.0m), "0561", includesMctd: false),
        ["Chenango|Norwich"] = new("Norwich (city)", Pct(8.0m), "0831", includesMctd: false),
        ["Fulton|Gloversville"] = new("Gloversville (city)", Pct(8.0m), "1741", includesMctd: false),
        ["Fulton|Johnstown"] = new("Johnstown (city)", Pct(8.0m), "1751", includesMctd: false),
        ["Madison|Oneida"] = new("Oneida (city)", Pct(8.0m), "2541", includesMctd: false),
        ["Oneida|Rome"] = new("Rome (city)", Pct(8.75m), "3015", includesMctd: false),
        ["Oneida|Utica"] = new("Utica (city)", Pct(8.75m), "3018", includesMctd: false),
        ["Oswego|Oswego"] = new("Oswego (city)", Pct(8.0m), "3561", includesMctd: false),
        ["St. Lawrence|Ogdensburg"] = new("Ogdensburg (city)", Pct(8.0m), "4012", includesMctd: false),
        ["Saratoga|Saratoga Springs"] = new("Saratoga Springs (city)", Pct(7.0m), "4131", includesMctd: false),
        ["Tompkins|Ithaca"] = new("Ithaca (city)", Pct(8.0m), "5021", includesMctd: false),
        ["Warren|Glens Falls"] = new("Glens Falls (city)", Pct(7.0m), "5211", includesMctd: false),

        // New York City and Westchester exceptions (MCTD applies).
        ["New York City|New York City"] = new("New York City", Pct(8.875m), "8081", includesMctd: true),
        ["Westchester|Mount Vernon"] = new("Mount Vernon (city)", Pct(8.375m), "5521", includesMctd: true),
        ["Westchester|New Rochelle"] = new("New Rochelle (city)", Pct(8.375m), "6861", includesMctd: true),
        ["Westchester|White Plains"] = new("White Plains (city)", Pct(8.375m), "6513", includesMctd: true),
        ["Westchester|Yonkers"] = new("Yonkers (city)", Pct(8.875m), "6511", includesMctd: true),
    };

    public static bool TryResolve(string? countyName, string? placeName, out Entry entry)
    {
        entry = County["New York State"];

        var county = NormalizeCounty(countyName);
        var place = NormalizePlace(placeName);

        if (string.IsNullOrWhiteSpace(county))
            return false;

        // NYC: Census may return county as Bronx/Kings/New York/Queens/Richmond and place as "New York city".
        if (IsNyCountyInNyc(county))
        {
            entry = City["New York City|New York City"];
            return true;
        }

        if (!string.IsNullOrWhiteSpace(place))
        {
            var key = $"{county}|{place}";
            if (City.TryGetValue(key, out var cityEntry))
            {
                entry = cityEntry;
                return true;
            }
        }

        if (County.TryGetValue(county, out var countyEntry))
        {
            entry = countyEntry;
            return true;
        }

        return false;
    }

    private static string? NormalizeCounty(string? county)
    {
        if (string.IsNullOrWhiteSpace(county)) return null;
        county = county.Trim();
        if (county.EndsWith(" County", StringComparison.OrdinalIgnoreCase))
            county = county[..^" County".Length];
        return county;
    }

    private static string? NormalizePlace(string? place)
    {
        if (string.IsNullOrWhiteSpace(place)) return null;
        place = place.Trim();
        // e.g. "Albany city" -> "Albany"
        if (place.EndsWith(" city", StringComparison.OrdinalIgnoreCase))
            place = place[..^" city".Length];
        return place;
    }

    private static bool IsNyCountyInNyc(string county) =>
        county.Equals("Bronx", StringComparison.OrdinalIgnoreCase) ||
        county.Equals("Kings", StringComparison.OrdinalIgnoreCase) ||
        county.Equals("New York", StringComparison.OrdinalIgnoreCase) ||
        county.Equals("Queens", StringComparison.OrdinalIgnoreCase) ||
        county.Equals("Richmond", StringComparison.OrdinalIgnoreCase);
}

