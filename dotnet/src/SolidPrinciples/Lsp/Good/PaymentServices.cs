namespace SolidPrinciples.Lsp.Good;

/// <summary>Works with every payment method, no type checks needed.</summary>
public sealed class PaymentProcessor
{
    public Receipt Pay(IPaymentMethod method, decimal amount)
    {
        ArgumentNullException.ThrowIfNull(method);
        return method.Charge(amount);
    }
}

/// <summary>
/// ✅ Asks only for methods that can be refunded. Passing a gift card is now a
/// compile-time error instead of a production incident.
/// </summary>
public sealed class RefundService
{
    public void RefundOrder(IRefundablePaymentMethod method, Receipt receipt)
    {
        ArgumentNullException.ThrowIfNull(method);
        method.Refund(receipt);
    }
}
