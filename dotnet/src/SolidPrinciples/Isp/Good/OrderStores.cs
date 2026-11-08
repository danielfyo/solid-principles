namespace SolidPrinciples.Isp.Good;

/// <summary>A full-featured store simply implements every role.</summary>
public sealed class InMemoryOrderStore : IOrderReader, IOrderWriter, ISalesStatistics
{
    private readonly Dictionary<string, StoredOrder> _orders = [];

    public StoredOrder? GetById(string id) => _orders.GetValueOrDefault(id);

    public void Save(StoredOrder order)
    {
        ArgumentNullException.ThrowIfNull(order);
        _orders[order.Id] = order;
    }

    public void Delete(string id) => _orders.Remove(id);

    public decimal TotalSalesFor(int year, int month) => SalesMath.Total(_orders.Values, year, month);
}

/// <summary>✅ The archive implements only what it can honestly do. No fake writes.</summary>
public sealed class ArchivedOrderStore(IEnumerable<StoredOrder> orders) : IOrderReader, ISalesStatistics
{
    private readonly Dictionary<string, StoredOrder> _orders = orders.ToDictionary(o => o.Id);

    public StoredOrder? GetById(string id) => _orders.GetValueOrDefault(id);

    public decimal TotalSalesFor(int year, int month) => SalesMath.Total(_orders.Values, year, month);
}

internal static class SalesMath
{
    public static decimal Total(IEnumerable<StoredOrder> orders, int year, int month) =>
        orders
            .Where(o => o.PlacedOn.Year == year && o.PlacedOn.Month == month)
            .Sum(o => o.Total);
}
