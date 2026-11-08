namespace SolidPrinciples.Lsp.Good;

public sealed record Receipt(string TransactionId, decimal Amount);

/// <summary>
/// Contract: amount must be positive; returns a receipt for exactly that amount.
/// Every implementation honours it, so any of them can replace any other.
/// </summary>
public interface IPaymentMethod
{
    string Name { get; }

    Receipt Charge(decimal amount);
}

/// <summary>
/// A richer promise, made only by types that can actually keep it.
/// Contract: refunding a receipt issued by this method succeeds exactly once.
/// </summary>
public interface IRefundablePaymentMethod : IPaymentMethod
{
    void Refund(Receipt receipt);
}
