using SolidPrinciples.Lsp.Good;

namespace SolidPrinciples.Tests;

public class LspTests
{
    [Fact]
    public void Bad_hierarchy_breaks_callers_that_trust_the_base_type()
    {
        var giftCard = new Lsp.Bad.GiftCardPayment();
        var receipt = giftCard.Charge(25m);

        // The caller did nothing wrong, yet substitution fails at runtime.
        Assert.Throws<NotSupportedException>(() => new Lsp.Bad.RefundService().RefundOrder(giftCard, receipt));
    }

    // Contract tests: ONE suite that every implementation must pass.
    // If a new subtype fails it, it is not a valid substitute.
    public static TheoryData<Func<IPaymentMethod>> AllPaymentMethods => new()
    {
        () => new CreditCardPayment(),
        () => new PayPalPayment(),
        () => new GiftCardPayment(),
    };

    public static TheoryData<Func<IRefundablePaymentMethod>> RefundablePaymentMethods => new()
    {
        () => new CreditCardPayment(),
        () => new PayPalPayment(),
    };

    [Theory]
    [MemberData(nameof(AllPaymentMethods))]
    public void Every_payment_method_charges_the_exact_amount(Func<IPaymentMethod> create)
    {
        var receipt = new PaymentProcessor().Pay(create(), 42.50m);

        Assert.Equal(42.50m, receipt.Amount);
        Assert.False(string.IsNullOrWhiteSpace(receipt.TransactionId));
    }

    [Theory]
    [MemberData(nameof(AllPaymentMethods))]
    public void Every_payment_method_rejects_non_positive_amounts(Func<IPaymentMethod> create)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => create().Charge(0m));
    }

    [Theory]
    [MemberData(nameof(RefundablePaymentMethods))]
    public void Every_refundable_method_refunds_its_own_receipts_once(Func<IRefundablePaymentMethod> create)
    {
        var method = create();
        var receipt = method.Charge(10m);
        var refunds = new RefundService();

        refunds.RefundOrder(method, receipt);

        Assert.Throws<InvalidOperationException>(() => refunds.RefundOrder(method, receipt));
    }

    [Fact]
    public void Gift_cards_are_simply_not_refundable_by_type()
    {
        // new RefundService().RefundOrder(new GiftCardPayment(), receipt); // ⛔ does not compile
        Assert.False(typeof(IRefundablePaymentMethod).IsAssignableFrom(typeof(GiftCardPayment)));
    }
}
