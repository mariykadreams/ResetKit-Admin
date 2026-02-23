namespace ResetKit.Admin.Api.Services;

/// <summary>
/// Simplified tax calculation for New York State composite sales tax.
/// DESIGN: This implementation uses fixed rates. In production, replace with
/// a real tax API or geospatial lookup that resolves lat/long to actual
/// State, County, City, and Special district rates without changing controllers.
/// </summary>
public class TaxService : ITaxService
{
    // Simplified NY State composite tax rates (placeholder; real rates vary by jurisdiction)
    private const decimal StateRate = 0.04m;      // 4.0%
    private const decimal CountyRate = 0.04m;     // 4.0%
    private const decimal CityRate = 0.005m;      // 0.5%
    private const decimal SpecialRate = 0.00375m; // 0.375%

    public TaxCalculationResult CalculateTax(decimal latitude, decimal longitude, decimal subtotal)
    {
        // In production: use lat/long to query a geospatial service or tax API
        // to obtain jurisdiction-specific rates. For now we use fixed rates.
        _ = latitude;
        _ = longitude;

        decimal compositeRate = StateRate + CountyRate + CityRate + SpecialRate;
        decimal taxAmount = Math.Round(subtotal * compositeRate, 2);
        decimal totalAmount = subtotal + taxAmount;

        return new TaxCalculationResult
        {
            StateRate = StateRate,
            CountyRate = CountyRate,
            CityRate = CityRate,
            SpecialRate = SpecialRate,
            CompositeTaxRate = compositeRate,
            TaxAmount = taxAmount,
            TotalAmount = totalAmount,
            Jurisdictions = "New York State, County, City, Special District"
        };
    }
}
