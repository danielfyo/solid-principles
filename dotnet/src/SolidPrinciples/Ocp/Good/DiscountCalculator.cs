namespace SolidPrinciples.Ocp.Good;

/// <summary>
/// ✅ Closed for modification: it applies the best available policy and
/// never needs to know which policies exist. Open for extension: pass more.
/// </summary>
public sealed class DiscountCalculator(IEnumerable<IDiscountPolicy> policies)
{
    private readonly IReadOnlyList<IDiscountPolicy> _policies = policies.ToList();

    public decimal CalculateDiscount(Cart cart)
    {
        ArgumentNullException.ThrowIfNull(cart);

        var best = _policies
            .Select(policy => policy.DiscountFor(cart))
            .DefaultIfEmpty(0m)
            .Max();

        var bounded = Math.Clamp(best, 0m, cart.Subtotal);
        return Math.Round(bounded, 2, MidpointRounding.AwayFromZero);
    }
}
