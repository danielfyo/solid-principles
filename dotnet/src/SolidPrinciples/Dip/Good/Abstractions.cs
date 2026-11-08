namespace SolidPrinciples.Dip.Good;

// ✅ The abstractions belong to the high-level policy. They speak the language
// of the business ("charge a customer", "notify a customer"), not of any vendor.

public sealed record PaymentResult(bool Succeeded, string? TransactionId, string? Error)
{
    public static PaymentResult Approved(string transactionId) => new(true, transactionId, null);

    public static PaymentResult Declined(string reason) => new(false, null, reason);
}

public interface IPaymentGateway
{
    Task<PaymentResult> ChargeAsync(string customerEmail, decimal amount, CancellationToken ct = default);
}

public interface ICustomerNotifier
{
    Task NotifyAsync(string customerEmail, string message, CancellationToken ct = default);
}
