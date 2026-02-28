namespace ResetKit.Admin.Api.Services;

/// <summary>
/// Local geolocation lookup: maps latitude/longitude to nearest city in New York State.
/// No external API calls; uses embedded NY cities dataset.
/// </summary>
public interface IGeoLocationService
{
    /// <summary>
    /// Gets the nearest city and county for the given coordinates within New York State.
    /// </summary>
    /// <param name="latitude">Latitude (WGS84 decimal degrees).</param>
    /// <param name="longitude">Longitude (WGS84 decimal degrees).</param>
    /// <returns>Location with State, County, City.</returns>
    /// <exception cref="InvalidOperationException">When coordinates are outside New York State.</exception>
    GeoLocationResult GetLocationFromCoordinates(decimal latitude, decimal longitude);
}
