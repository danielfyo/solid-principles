using System.Globalization;

namespace SolidPrinciples.Srp.Good;

/// <summary>Single reason to change: what the customer is told and how.</summary>
public sealed class OrderConfirmationNotifier
{
    private readonly List<string> _sentMessages = [];

    public IReadOnlyList<string> SentMessages => _sentMessages;

    public void NotifyOrderPlaced(Order order, OrderTotals totals)
    {
        ArgumentNullException.ThrowIfNull(order);
        ArgumentNullException.ThrowIfNull(totals);

        _sentMessages.Add(string.Create(
            CultureInfo.InvariantCulture,
            $"To: {order.CustomerEmail} | Order {order.Id} confirmed | Total: {totals.Total:0.00} EUR"));
    }
}
