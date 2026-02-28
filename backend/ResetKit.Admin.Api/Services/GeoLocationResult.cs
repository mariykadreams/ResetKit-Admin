namespace ResetKit.Admin.Api.Services;

/// <summary>
/// Result of a local geolocation lookup (nearest city in NY from coordinates).
/// </summary>
public record GeoLocationResult(string State, string County, string City);
