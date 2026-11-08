namespace SolidPrinciples.Lsp.Good;

public sealed class CreditCardPayment : IRefundablePaymentMethod
{
    private readonly PaymentLedger _ledger = new("card");

    public string Name => "card";

    public Receipt Charge(decimal amount) => _ledger.Record(amount);

    public void Refund(Receipt receipt) => _ledger.Reverse(receipt);
}

public sealed class PayPalPayment : IRefundablePaymentMethod
{
    private readonly PaymentLedger _ledger = new("paypal");

    public string Name => "paypal";

    public Receipt Charge(decimal amount) => _ledger.Record(amount);

    public void Refund(Receipt receipt) => _ledger.Reverse(receipt);
}

/// <summary>
/// ✅ A gift card only promises what it can deliver: it can be charged.
/// It is a perfectly substitutable <see cref="IPaymentMethod"/>.
/// </summary>
public sealed class GiftCardPayment : IPaymentMethod
{
    private readonly PaymentLedger _ledger = new("giftcard");

    public string Name => "giftcard";

    public Receipt Charge(decimal amount) => _ledger.Record(amount);
}
