namespace SolidPrinciples.Dip.Good.Infrastructure;

/// <summary>Stand-in for a third-party payment SDK. We do not control its API.</summary>
public sealed class StripeApiClient
{
    private int _sequence;

    public Task<string> CreateChargeAsync(string customerEmail, long amountInCents, CancellationToken ct = default)
    {
        Console.WriteLine($"[stripe] charging {amountInCents} cents to {customerEmail}");
        return Task.FromResult($"ch_{++_sequence}");
    }
}

/// <summary>Stand-in for an SMTP library.</summary>
public sealed class SmtpEmailSender
{
    public Task SendAsync(string to, string subject, string body, CancellationToken ct = default)
    {
        Console.WriteLine($"[smtp] to={to} subject={subject} body={body}");
        return Task.CompletedTask;
    }
}
