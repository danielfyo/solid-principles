namespace SolidPrinciples.Lsp.Bad;

public sealed record Receipt(string TransactionId, decimal Amount);

/// <summary>
/// The base class promises that every payment method can be charged AND refunded.
/// </summary>
public abstract class PaymentMethod
{
    private readonly HashSet<string> _issued = [];
    private int _sequence;

    public abstract string Name { get; }

    public Receipt Charge(decimal amount)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(amount);
        var receipt = new Receipt($"{Name}-{++_sequence}", amount);
        _issued.Add(receipt.TransactionId);
        return receipt;
    }

    public virtual void Refund(Receipt receipt)
    {
        ArgumentNullException.ThrowIfNull(receipt);
        if (!_issued.Remove(receipt.TransactionId))
        {
            throw new InvalidOperationException($"Unknown transaction {receipt.TransactionId}.");
        }
    }
}

public sealed class CreditCardPayment : PaymentMethod
{
    public override string Name => "card";
}

public sealed class PayPalPayment : PaymentMethod
{
    public override string Name => "paypal";
}

/// <summary>
/// ❌ LSP violation: it IS-A PaymentMethod by inheritance, but it cannot keep the
/// promise of <see cref="PaymentMethod.Refund"/>. It strengthens the precondition
/// ("never call me") and surprises every caller that trusted the base type.
/// </summary>
public sealed class GiftCardPayment : PaymentMethod
{
    public override string Name => "giftcard";

    public override void Refund(Receipt receipt) =>
        throw new NotSupportedException("Gift card payments cannot be refunded.");
}

/// <summary>Written against the base type, as it should be... and it still breaks.</summary>
public sealed class RefundService
{
    public void RefundOrder(PaymentMethod method, Receipt receipt)
    {
        ArgumentNullException.ThrowIfNull(method);
        method.Refund(receipt); // 💥 NotSupportedException at runtime for gift cards
    }
}
