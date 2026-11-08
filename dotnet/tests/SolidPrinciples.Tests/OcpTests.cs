using SolidPrinciples.Ocp.Good;

namespace SolidPrinciples.Tests;

public class OcpTests
{
    private static readonly DiscountCalculator Calculator = new(DefaultDiscounts.Create());

    [Theory]
    [InlineData(CustomerTier.Regular, 100, 1, 0)]
    [InlineData(CustomerTier.Premium, 100, 1, 10)]
    [InlineData(CustomerTier.Vip, 100, 12, 20)]
    [InlineData(CustomerTier.Regular, 100, 12, 5)]
    public void Good_calculator_applies_the_best_policy(CustomerTier tier, decimal subtotal, int items, decimal expected)
    {
        Assert.Equal(expected, Calculator.CalculateDiscount(new Cart(tier, subtotal, items)));
    }

    [Theory]
    [InlineData(Ocp.Bad.CustomerTier.Regular, 100, 1, 0)]
    [InlineData(Ocp.Bad.CustomerTier.Premium, 100, 1, 10)]
    [InlineData(Ocp.Bad.CustomerTier.Vip, 100, 12, 20)]
    [InlineData(Ocp.Bad.CustomerTier.Regular, 100, 12, 5)]
    public void Bad_calculator_gives_the_same_results_today(Ocp.Bad.CustomerTier tier, decimal subtotal, int items, decimal expected)
    {
        var bad = new Ocp.Bad.DiscountCalculator();

        Assert.Equal(expected, bad.CalculateDiscount(new Ocp.Bad.Cart(tier, subtotal, items)));
    }

    /// <summary>A brand-new promotion, written without touching any production class.</summary>
    private sealed class FlatCouponDiscount(decimal amount) : IDiscountPolicy
    {
        public decimal DiscountFor(Cart cart) => amount;
    }

    [Fact]
    public void New_policies_extend_behaviour_without_modifying_the_calculator()
    {
        var calculator = new DiscountCalculator([.. DefaultDiscounts.Create(), new FlatCouponDiscount(15m)]);

        Assert.Equal(15m, calculator.CalculateDiscount(new Cart(CustomerTier.Premium, 100m, 1)));
    }

    [Fact]
    public void Discount_never_exceeds_the_subtotal()
    {
        var calculator = new DiscountCalculator([new FlatCouponDiscount(50m)]);

        Assert.Equal(30m, calculator.CalculateDiscount(new Cart(CustomerTier.Regular, 30m, 1)));
    }
}
