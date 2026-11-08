using System.Globalization;

namespace SolidPrinciples.Srp.Bad;

public sealed record OrderLine(string Sku, decimal UnitPrice, int Quantity);

public sealed record Order(string Id, string CustomerEmail, IReadOnlyList<OrderLine> Lines);

/// <summary>
/// ❌ SRP violation: one class validates, prices, persists and notifies.
/// Four different actors (product owner, finance, DBA, marketing) can each
/// force a change here, and every change risks breaking the other three jobs.
/// </summary>
public sealed class OrderService
{
    private const decimal TaxRate = 0.21m;

    private readonly Dictionary<string, decimal> _ordersTable = [];
    private readonly List<string> _sentEmails = [];

    public IReadOnlyDictionary<string, decimal> OrdersTable => _ordersTable;

    public IReadOnlyList<string> SentEmails => _sentEmails;

    public decimal PlaceOrder(Order order)
    {
        ArgumentNullException.ThrowIfNull(order);

        // 1) Business rules (product owner)
        if (order.Lines.Count == 0)
        {
            throw new InvalidOperationException("An order needs at least one line.");
        }

        if (order.Lines.Any(line => line.Quantity <= 0))
        {
            throw new InvalidOperationException("Quantities must be positive.");
        }

        if (!order.CustomerEmail.Contains('@', StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Customer email is invalid.");
        }

        // 2) Pricing and taxes (finance)
        var subtotal = order.Lines.Sum(line => line.UnitPrice * line.Quantity);
        var total = Math.Round(subtotal * (1 + TaxRate), 2, MidpointRounding.AwayFromZero);

        // 3) Persistence (DBA / infrastructure)
        _ordersTable[order.Id] = total;

        // 4) Notification wording and delivery (marketing)
        _sentEmails.Add(string.Create(
            CultureInfo.InvariantCulture,
            $"To: {order.CustomerEmail} | Order {order.Id} confirmed | Total: {total:0.00} EUR"));

        return total;
    }
}
