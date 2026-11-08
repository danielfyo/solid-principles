namespace SolidPrinciples.Ocp.Good;

public sealed class TierDiscount(CustomerTier tier, decimal rate) : IDiscountPolicy
{
    public decimal DiscountFor(Cart cart)
    {
        ArgumentNullException.ThrowIfNull(cart);
        return cart.Tier == tier ? cart.Subtotal * rate : 0m;
    }
}

public sealed class BulkDiscount(int minimumItems, decimal rate) : IDiscountPolicy
{
    public decimal DiscountFor(Cart cart)
    {
        ArgumentNullException.ThrowIfNull(cart);
        return cart.ItemCount >= minimumItems ? cart.Subtotal * rate : 0m;
    }
}

public static class DefaultDiscounts
{
    public static IReadOnlyList<IDiscountPolicy> Create() =>
    [
        new TierDiscount(CustomerTier.Premium, 0.10m),
        new TierDiscount(CustomerTier.Vip, 0.20m),
        new BulkDiscount(minimumItems: 10, rate: 0.05m),
    ];
}
