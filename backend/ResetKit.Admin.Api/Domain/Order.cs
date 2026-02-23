namespace ResetKit.Admin.Api.Domain;

/// <summary>
/// Represents a delivery order with GPS coordinates and composite tax breakdown.
/// Tax is calculated based on delivery location (lat/long) - in production,
/// this would resolve to actual NY State jurisdictions.
/// </summary>
public class Order
{
    public int Id { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public decimal Subtotal { get; set; }

    /// <summary>Sum of State + County + City + Special rates (e.g., 0.08875).</summary>
    public decimal CompositeTaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }

    // Tax breakdown for transparency and auditing
    public decimal StateRate { get; set; }
    public decimal CountyRate { get; set; }
    public decimal CityRate { get; set; }
    public decimal SpecialRate { get; set; }

    /// <summary>Human-readable jurisdiction names, e.g. "New York State, County, City, Special District"</summary>
    public string Jurisdictions { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}
