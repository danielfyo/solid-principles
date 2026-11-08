namespace SolidPrinciples.Srp.Good;

/// <summary>Single reason to change: how finance computes money.</summary>
public sealed class PriceCalculator(decimal taxRate)
{
    public OrderTotals Calculate(Order order)
    {
        ArgumentNullException.ThrowIfNull(order);

        var subtotal = order.Lines.Sum(line => line.UnitPrice * line.Quantity);
        var tax = Math.Round(subtotal * taxRate, 2, MidpointRounding.AwayFromZero);
        return new OrderTotals(subtotal, tax, subtotal + tax);
    }
}
