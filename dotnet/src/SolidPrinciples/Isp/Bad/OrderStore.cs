using System.Globalization;

namespace SolidPrinciples.Isp.Bad;

public sealed record StoredOrder(string Id, string CustomerName, decimal Total, DateOnly PlacedOn);

/// <summary>
/// ❌ ISP violation: a "fat" interface that mixes reading, writing and reporting.
/// Every client depends on all of it, even if it uses one method.
/// </summary>
public interface IOrderStore
{
    StoredOrder? GetById(string id);

    void Save(StoredOrder order);

    void Delete(string id);

    decimal TotalSalesFor(int year, int month);
}

/// <summary>
/// Read-only archive of old orders. It is forced to "implement" writes it can
/// never support, so it lies with exceptions (which is also an LSP smell).
/// </summary>
public sealed class ArchivedOrderStore(IEnumerable<StoredOrder> orders) : IOrderStore
{
    private readonly Dictionary<string, StoredOrder> _orders = orders.ToDictionary(o => o.Id);

    public StoredOrder? GetById(string id) => _orders.GetValueOrDefault(id);

    public void Save(StoredOrder order) =>
        throw new NotSupportedException("The archive is read-only.");

    public void Delete(string id) =>
        throw new NotSupportedException("The archive is read-only.");

    public decimal TotalSalesFor(int year, int month) =>
        _orders.Values
            .Where(o => o.PlacedOn.Year == year && o.PlacedOn.Month == month)
            .Sum(o => o.Total);
}

/// <summary>
/// Only needs <c>GetById</c>, yet it is coupled to writes and reports. Any change
/// to those members recompiles/redeploys it, and its test doubles must fake all four.
/// </summary>
public sealed class InvoicePrinter(IOrderStore store)
{
    public string Print(string orderId)
    {
        var order = store.GetById(orderId)
            ?? throw new KeyNotFoundException($"Order {orderId} not found.");

        return string.Create(
            CultureInfo.InvariantCulture,
            $"Invoice {order.Id} | {order.CustomerName} | {order.Total:0.00} EUR");
    }
}
