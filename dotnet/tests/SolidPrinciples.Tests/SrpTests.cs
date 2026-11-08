using SolidPrinciples.Srp.Good;

namespace SolidPrinciples.Tests;

public class SrpTests
{
    private static Order SampleOrder() =>
        new("A-1", "ana@example.com", [new OrderLine("BOOK", 10.00m, 2)]);

    [Fact]
    public void Bad_and_good_versions_compute_the_same_total()
    {
        var bad = new Srp.Bad.OrderService();
        var badTotal = bad.PlaceOrder(new Srp.Bad.Order("A-1", "ana@example.com", [new Srp.Bad.OrderLine("BOOK", 10.00m, 2)]));

        var good = new PriceCalculator(0.21m).Calculate(SampleOrder());

        Assert.Equal(24.20m, badTotal);
        Assert.Equal(badTotal, good.Total);
    }

    // Each responsibility can now be tested in isolation, with no database or email involved.
    [Fact]
    public void PriceCalculator_splits_subtotal_and_tax()
    {
        var totals = new PriceCalculator(0.21m).Calculate(SampleOrder());

        Assert.Equal(new OrderTotals(20.00m, 4.20m, 24.20m), totals);
    }

    [Theory]
    [InlineData("no-at-sign", 1, "Customer email is invalid.")]
    [InlineData("ana@example.com", 0, "Quantities must be positive.")]
    public void OrderValidator_rejects_invalid_orders(string email, int quantity, string expected)
    {
        var order = new Order("A-2", email, [new OrderLine("BOOK", 10m, quantity)]);

        var error = Assert.Throws<InvalidOrderException>(() => new OrderValidator().EnsureValid(order));
        Assert.Equal(expected, error.Message);
    }

    [Fact]
    public void OrderService_coordinates_the_collaborators()
    {
        var repository = new OrderRepository();
        var notifier = new OrderConfirmationNotifier();
        var service = new OrderService(new OrderValidator(), new PriceCalculator(0.21m), repository, notifier);

        var totals = service.PlaceOrder(SampleOrder());

        Assert.Equal(totals, repository.FindTotals("A-1"));
        Assert.Equal("To: ana@example.com | Order A-1 confirmed | Total: 24.20 EUR", Assert.Single(notifier.SentMessages));
    }

    [Fact]
    public void OrderService_does_not_save_or_notify_invalid_orders()
    {
        var repository = new OrderRepository();
        var notifier = new OrderConfirmationNotifier();
        var service = new OrderService(new OrderValidator(), new PriceCalculator(0.21m), repository, notifier);

        Assert.Throws<InvalidOrderException>(() => service.PlaceOrder(new Order("A-3", "ana@example.com", [])));
        Assert.Null(repository.FindTotals("A-3"));
        Assert.Empty(notifier.SentMessages);
    }
}
