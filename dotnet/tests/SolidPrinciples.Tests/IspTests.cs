using SolidPrinciples.Isp.Good;

namespace SolidPrinciples.Tests;

public class IspTests
{
    private static readonly StoredOrder March = new("O-1", "Ana", 120.00m, new DateOnly(2026, 3, 14));
    private static readonly StoredOrder MarchToo = new("O-2", "Luis", 30.50m, new DateOnly(2026, 3, 20));
    private static readonly StoredOrder April = new("O-3", "Eva", 99.99m, new DateOnly(2026, 4, 2));

    [Fact]
    public void Bad_fat_interface_forces_the_archive_to_lie()
    {
        var archive = new Isp.Bad.ArchivedOrderStore([]);

        Assert.Throws<NotSupportedException>(() => archive.Delete("O-1"));
    }

    /// <summary>With a narrow interface, a test double is one line long.</summary>
    private sealed class StubReader(StoredOrder order) : IOrderReader
    {
        public StoredOrder? GetById(string id) => id == order.Id ? order : null;
    }

    [Fact]
    public void InvoicePrinter_only_needs_a_reader()
    {
        var printer = new InvoicePrinter(new StubReader(March));

        Assert.Equal("Invoice O-1 | Ana | 120.00 EUR", printer.Print("O-1"));
        Assert.Throws<KeyNotFoundException>(() => printer.Print("missing"));
    }

    [Fact]
    public void Read_only_archive_works_with_reading_and_reporting_clients()
    {
        var archive = new ArchivedOrderStore([March, MarchToo, April]);

        Assert.Equal("Invoice O-3 | Eva | 99.99 EUR", new InvoicePrinter(archive).Print("O-3"));
        Assert.Equal("2026-03: 150.50 EUR", new SalesDashboard(archive).MonthlySummary(2026, 3));
    }

    [Fact]
    public void Live_store_plays_every_role()
    {
        var store = new InMemoryOrderStore();
        store.Save(March);
        store.Save(April);
        store.Delete("O-3");

        Assert.NotNull(store.GetById("O-1"));
        Assert.Null(store.GetById("O-3"));
        Assert.Equal(0m, store.TotalSalesFor(2026, 4));
    }
}
