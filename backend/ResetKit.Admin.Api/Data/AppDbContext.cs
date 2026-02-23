using Microsoft.EntityFrameworkCore;
using ResetKit.Admin.Api.Domain;

namespace ResetKit.Admin.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<Order>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Latitude).HasPrecision(10, 6);
            e.Property(x => x.Longitude).HasPrecision(10, 6);
            e.Property(x => x.Subtotal).HasPrecision(18, 2);
            e.Property(x => x.CompositeTaxRate).HasPrecision(10, 6);
            e.Property(x => x.TaxAmount).HasPrecision(18, 2);
            e.Property(x => x.TotalAmount).HasPrecision(18, 2);
            e.Property(x => x.StateRate).HasPrecision(10, 6);
            e.Property(x => x.CountyRate).HasPrecision(10, 6);
            e.Property(x => x.CityRate).HasPrecision(10, 6);
            e.Property(x => x.SpecialRate).HasPrecision(10, 6);
            e.Property(x => x.Jurisdictions).HasMaxLength(500);
        });
    }
}
