namespace SolidPrinciples.Lsp.Good;

/// <summary>Shared bookkeeping, reused through composition instead of inheritance.</summary>
internal sealed class PaymentLedger(string prefix)
{
    private readonly HashSet<string> _refundable = [];
    private int _sequence;

    public Receipt Record(decimal amount)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(amount);
        var receipt = new Receipt($"{prefix}-{++_sequence}", amount);
        _refundable.Add(receipt.TransactionId);
        return receipt;
    }

    public void Reverse(Receipt receipt)
    {
        ArgumentNullException.ThrowIfNull(receipt);
        if (!_refundable.Remove(receipt.TransactionId))
        {
            throw new InvalidOperationException($"Unknown transaction {receipt.TransactionId}.");
        }
    }
}
