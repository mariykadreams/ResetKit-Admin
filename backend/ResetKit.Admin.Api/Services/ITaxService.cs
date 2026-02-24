namespace ResetKit.Admin.Api.Services;

/// <summary>
/// Abstraction for tax calculation. Designed for easy replacement with a real
/// tax API (e.g. TaxJar, Avalara) or geospatial dataset without changing controllers.
/// </summary>
public interface ITaxService
{
    /// <summary>
    /// Calculates composite sales tax for a delivery at the given GPS coordinates.
    /// Implementations may call external services (e.g. Nominatim, NY tax tables),
    /// so this API is asynchronous.
    /// </summary>
    Task<TaxCalculationResult> CalculateTaxAsync(
        decimal latitude,
        decimal longitude,
        decimal subtotal,
        CancellationToken ct = default);
}
