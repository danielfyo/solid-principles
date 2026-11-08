namespace SolidPrinciples.Ocp.Bad;

public enum CustomerTier
{
    Regular,
    Premium,
    Vip,
}

public sealed record Cart(CustomerTier Tier, decimal Subtotal, int ItemCount);

/// <summary>
/// ❌ OCP violation: every new promotion forces us to open, edit and re-test
/// this method. The switch grows forever and becomes a merge-conflict magnet.
/// </summary>
public sealed class DiscountCalculator
{
    public decimal CalculateDiscount(Cart cart)
    {
        ArgumentNullException.ThrowIfNull(cart);

        var discount = cart.Tier switch
        {
            CustomerTier.Regular => 0m,
            CustomerTier.Premium => cart.Subtotal * 0.10m,
            CustomerTier.Vip => cart.Subtotal * 0.20m,
            _ => throw new ArgumentOutOfRangeException(nameof(cart), cart.Tier, "Unknown tier."),
        };

        // Marketing asked for a bulk discount... so we patched it in here.
        // Next month: Black Friday, coupons, first purchase... more edits.
        if (cart.ItemCount >= 10)
        {
            discount = Math.Max(discount, cart.Subtotal * 0.05m);
        }

        return Math.Round(discount, 2, MidpointRounding.AwayFromZero);
    }
}
