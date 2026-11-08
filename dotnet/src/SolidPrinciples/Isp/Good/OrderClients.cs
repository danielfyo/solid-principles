using System.Globalization;

namespace SolidPrinciples.Isp.Good;

/// <summary>✅ Depends only on reading. Works with the live store and the archive.</summary>
public sealed class InvoicePrinter(IOrderReader orders)
{
    public string Print(string orderId)
    {
        var order = orders.GetById(orderId)
            ?? throw new KeyNotFoundException($"Order {orderId} not found.");

        return string.Create(
            CultureInfo.InvariantCulture,
            $"Invoice {order.Id} | {order.CustomerName} | {order.Total:0.00} EUR");
    }
}

/// <summary>✅ Depends only on statistics.</summary>
public sealed class SalesDashboard(ISalesStatistics statistics)
{
    public string MonthlySummary(int year, int month) =>
        string.Create(
            CultureInfo.InvariantCulture,
            $"{year:D4}-{month:D2}: {statistics.TotalSalesFor(year, month):0.00} EUR");
}
