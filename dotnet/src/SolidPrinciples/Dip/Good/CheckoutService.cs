using System.Globalization;

namespace SolidPrinciples.Dip.Good;

public sealed record CheckoutResult(bool Succeeded, string Message);

/// <summary>
/// ✅ High-level policy that depends only on abstractions it owns. It has no
/// idea whether payments go through Stripe, Adyen or a test fake.
/// </summary>
public sealed class CheckoutService(IPaymentGateway payments, ICustomerNotifier notifier)
{
    public async Task<CheckoutResult> CheckoutAsync(string customerEmail, decimal amount, CancellationToken ct = default)
    {
        var payment = await payments.ChargeAsync(customerEmail, amount, ct).ConfigureAwait(false);
        if (!payment.Succeeded)
        {
            return new CheckoutResult(false, $"Payment declined: {payment.Error}");
        }

        var message = string.Create(
            CultureInfo.InvariantCulture,
            $"Payment of {amount:0.00} EUR received ({payment.TransactionId}).");
        await notifier.NotifyAsync(customerEmail, message, ct).ConfigureAwait(false);

        return new CheckoutResult(true, message);
    }
}
