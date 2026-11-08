from collections.abc import Callable
from decimal import Decimal

import pytest

from solid.lsp import bad
from solid.lsp.good import (
    CreditCardPayment,
    GiftCardPayment,
    PaymentMethod,
    PaymentProcessor,
    PayPalPayment,
    RefundablePaymentMethod,
    RefundService,
)


def test_bad_hierarchy_breaks_callers_that_trust_the_base_type() -> None:
    gift_card = bad.GiftCardPayment()
    receipt = gift_card.charge(Decimal(25))

    # The caller did nothing wrong, yet substitution fails at runtime.
    with pytest.raises(NotImplementedError):
        bad.RefundService().refund_order(gift_card, receipt)


# Contract tests: ONE suite that every implementation must pass.
ALL_METHODS: list[Callable[[], PaymentMethod]] = [CreditCardPayment, PayPalPayment, GiftCardPayment]
REFUNDABLE_METHODS: list[Callable[[], RefundablePaymentMethod]] = [CreditCardPayment, PayPalPayment]


@pytest.mark.parametrize("create", ALL_METHODS)
def test_every_method_charges_the_exact_amount(create: Callable[[], PaymentMethod]) -> None:
    receipt = PaymentProcessor().pay(create(), Decimal("42.50"))

    assert receipt.amount == Decimal("42.50")
    assert receipt.transaction_id


@pytest.mark.parametrize("create", ALL_METHODS)
def test_every_method_rejects_non_positive_amounts(create: Callable[[], PaymentMethod]) -> None:
    with pytest.raises(ValueError, match="positive"):
        create().charge(Decimal(0))


@pytest.mark.parametrize("create", REFUNDABLE_METHODS)
def test_every_refundable_method_refunds_its_own_receipts_once(
    create: Callable[[], RefundablePaymentMethod],
) -> None:
    method = create()
    receipt = method.charge(Decimal(10))
    refunds = RefundService()

    refunds.refund_order(method, receipt)

    with pytest.raises(LookupError):
        refunds.refund_order(method, receipt)


def test_gift_cards_are_simply_not_refundable() -> None:
    # RefundService().refund_order(GiftCardPayment(), receipt)  # ⛔ rejected by mypy
    assert not hasattr(GiftCardPayment(), "refund")
