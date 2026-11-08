namespace SolidPrinciples.Dip.Good.Infrastructure;

/// <summary>✅ Low-level detail that depends on (implements) the domain abstraction.</summary>
public sealed class StripePaymentGateway(StripeApiClient client) : IPaymentGateway
{
    public async Task<PaymentResult> ChargeAsync(string customerEmail, decimal amount, CancellationToken ct = default)
    {
        var cents = (long)Math.Round(amount * 100, MidpointRounding.AwayFromZero);
        var chargeId = await client.CreateChargeAsync(customerEmail, cents, ct).ConfigureAwait(false);
        return PaymentResult.Approved(chargeId);
    }
}

public sealed class EmailCustomerNotifier(SmtpEmailSender smtp) : ICustomerNotifier
{
    public Task NotifyAsync(string customerEmail, string message, CancellationToken ct = default) =>
        smtp.SendAsync(customerEmail, "Thanks for your order", message, ct);
}
