namespace ResetKit.Admin.Api.Dtos;

/// <summary>
/// DTO for returning order data in API responses.
/// </summary>
public class OrderResponse
{
    public int Id { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public decimal Subtotal { get; set; }

    public string? LocationState { get; set; }
    public string? LocationCounty { get; set; }
    public string? LocationCity { get; set; }
    public string? LocationZip { get; set; }
    public string? LocationDistrict { get; set; }
    public string? LocationSource { get; set; }
    public string? LocationReportingCode { get; set; }

    public decimal CompositeTaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal StateRate { get; set; }
    public decimal CountyRate { get; set; }
    public decimal CityRate { get; set; }
    public decimal SpecialRate { get; set; }
    public string Jurisdictions { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
