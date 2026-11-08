using System.Globalization;

namespace SolidPrinciples.Dip.Bad;

/// <summary>Stand-in for a third-party payment SDK (low-level detail).</summary>
public sealed class StripeApiClient
{
    private int _sequence;

    public Task<string> CreateChargeAsync(string customerEmail, long amountInCents, CancellationToken ct = default)
    {
        // Imagine a real HTTP call here: network, API keys, rate limits...
        Console.WriteLine($"[stripe] charging {amountInCents} cents to {customerEmail}");
        return Task.FromResult($"ch_{++_sequence}");
    }
}

/// <summary>Stand-in for an SMTP library (low-level detail).</summary>
public sealed class SmtpEmailSender
{
    public Task SendAsync(string to, string subject, string body, CancellationToken ct = default)
    {
        Console.WriteLine($"[smtp] to={to} subject={subject} body={body}");
        return Task.CompletedTask;
    }
}

public sealed record CheckoutResult(bool Succeeded, string Message);

/// <summary>
/// ❌ DIP violation: the high-level business policy (checkout) creates and
/// depends on low-level concrete details (Stripe, SMTP).
/// - Cannot be unit-tested without hitting "Stripe" and "SMTP".
/// - Cannot simulate a declined card.
/// - Switching to another provider means rewriting business code.
/// </summary>
public sealed class CheckoutService
{
    private readonly StripeApiClient _stripe = new();
    private readonly SmtpEmailSender _email = new();

    public async Task<CheckoutResult> CheckoutAsync(string customerEmail, decimal amount, CancellationToken ct = default)
    {
        var cents = (long)Math.Round(amount * 100, MidpointRounding.AwayFromZero);
        var chargeId = await _stripe.CreateChargeAsync(customerEmail, cents, ct).ConfigureAwait(false);

        var body = string.Create(CultureInfo.InvariantCulture, $"Payment of {amount:0.00} EUR received ({chargeId}).");
        await _email.SendAsync(customerEmail, "Thanks for your order", body, ct).ConfigureAwait(false);

        return new CheckoutResult(true, body);
    }
}
