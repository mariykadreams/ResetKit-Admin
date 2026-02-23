using System.ComponentModel.DataAnnotations;

namespace ResetKit.Admin.Api.Dtos;

/// <summary>
/// DTO for manually creating a new order.
/// </summary>
public class CreateOrderRequest
{
    [Required]
    [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90.")]
    public decimal Latitude { get; set; }

    [Required]
    [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180.")]
    public decimal Longitude { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Subtotal must be greater than 0.")]
    public decimal Subtotal { get; set; }
}
