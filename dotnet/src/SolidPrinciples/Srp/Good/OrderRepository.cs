namespace SolidPrinciples.Srp.Good;

/// <summary>Single reason to change: how orders are stored.</summary>
public sealed class OrderRepository
{
    private readonly Dictionary<string, OrderTotals> _orders = [];

    public void Save(Order order, OrderTotals totals)
    {
        ArgumentNullException.ThrowIfNull(order);
        _orders[order.Id] = totals;
    }

    public OrderTotals? FindTotals(string orderId) =>
        _orders.TryGetValue(orderId, out var totals) ? totals : null;
}
