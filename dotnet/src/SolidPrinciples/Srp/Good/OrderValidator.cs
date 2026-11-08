namespace SolidPrinciples.Srp.Good;

/// <summary>Single reason to change: the business rules that define a valid order.</summary>
public sealed class OrderValidator
{
    public void EnsureValid(Order order)
    {
        ArgumentNullException.ThrowIfNull(order);

        if (order.Lines.Count == 0)
        {
            throw new InvalidOrderException("An order needs at least one line.");
        }

        if (order.Lines.Any(line => line.Quantity <= 0))
        {
            throw new InvalidOrderException("Quantities must be positive.");
        }

        if (!order.CustomerEmail.Contains('@', StringComparison.Ordinal))
        {
            throw new InvalidOrderException("Customer email is invalid.");
        }
    }
}
