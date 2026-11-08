using SolidPrinciples.Dip.Good;

namespace SolidPrinciples.Tests;

public class DipTests
{
    private sealed class FakePaymentGateway(PaymentResult result) : IPaymentGateway
    {
        public List<(string Email, decimal Amount)> Charges { get; } = [];

        public Task<PaymentResult> ChargeAsync(string customerEmail, decimal amount, CancellationToken ct = default)
        {
            Charges.Add((customerEmail, amount));
            return Task.FromResult(result);
        }
    }

    private sealed class SpyNotifier : ICustomerNotifier
    {
        public List<string> Messages { get; } = [];

        public Task NotifyAsync(string customerEmail, string message, CancellationToken ct = default)
        {
            Messages.Add($"{customerEmail}: {message}");
            return Task.CompletedTask;
        }
    }

    [Fact]
    public async Task Successful_checkout_notifies_the_customer()
    {
        var gateway = new FakePaymentGateway(PaymentResult.Approved("tx_1"));
        var notifier = new SpyNotifier();
        var checkout = new CheckoutService(gateway, notifier);

        var result = await checkout.CheckoutAsync("ana@example.com", 24.20m);

        Assert.True(result.Succeeded);
        Assert.Equal(("ana@example.com", 24.20m), Assert.Single(gateway.Charges));
        Assert.Equal("ana@example.com: Payment of 24.20 EUR received (tx_1).", Assert.Single(notifier.Messages));
    }

    [Fact]
    public async Task Declined_payment_is_easy_to_simulate_and_sends_nothing()
    {
        var notifier = new SpyNotifier();
        var checkout = new CheckoutService(new FakePaymentGateway(PaymentResult.Declined("insufficient funds")), notifier);

        var result = await checkout.CheckoutAsync("ana@example.com", 24.20m);

        Assert.Equal(new CheckoutResult(false, "Payment declined: insufficient funds"), result);
        Assert.Empty(notifier.Messages);
    }

    [Fact]
    public async Task Composition_root_wires_the_real_adapters()
    {
        var result = await CompositionRoot.CreateCheckoutService().CheckoutAsync("ana@example.com", 10m);

        Assert.Equal("Payment of 10.00 EUR received (ch_1).", result.Message);
    }
}
