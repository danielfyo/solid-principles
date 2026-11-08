namespace SolidPrinciples.Srp.Good;

/// <summary>
/// ✅ The service only coordinates the workflow. Every decision lives in a
/// collaborator that has exactly one reason to change.
/// </summary>
public sealed class OrderService(
    OrderValidator validator,
    PriceCalculator calculator,
    OrderRepository repository,
    OrderConfirmationNotifier notifier)
{
    public OrderTotals PlaceOrder(Order order)
    {
        validator.EnsureValid(order);
        var totals = calculator.Calculate(order);
        repository.Save(order, totals);
        notifier.NotifyOrderPlaced(order, totals);
        return totals;
    }
}
