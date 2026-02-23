namespace ResetKit.Admin.Api.Services;

/// <summary>
/// Result of a tax calculation. Contains rates, amounts, and jurisdiction info.
/// </summary>
public record TaxCalculationResult
{
    public decimal StateRate { get; init; }
    public decimal CountyRate { get; init; }
    public decimal CityRate { get; init; }
    public decimal SpecialRate { get; init; }
    public decimal CompositeTaxRate { get; init; }
    public decimal TaxAmount { get; init; }
    public decimal TotalAmount { get; init; }
    public string Jurisdictions { get; init; } = string.Empty;
}
