"""LSP - the solution: only promise what every subtype can deliver."""

from dataclasses import dataclass
from decimal import Decimal
from typing import Protocol


@dataclass(frozen=True)
class Receipt:
    transaction_id: str
    amount: Decimal


class PaymentMethod(Protocol):
    """Contract: amount must be positive; returns a receipt for exactly that amount."""

    @property
    def name(self) -> str: ...

    def charge(self, amount: Decimal) -> Receipt: ...


class RefundablePaymentMethod(PaymentMethod, Protocol):
    """A richer promise, made only by types that can keep it.

    Contract: refunding a receipt issued by this method succeeds exactly once.
    """

    def refund(self, receipt: Receipt) -> None: ...


class _PaymentLedger:
    """Shared bookkeeping, reused through composition instead of inheritance."""

    def __init__(self, prefix: str) -> None:
        self._prefix = prefix
        self._refundable: set[str] = set()
        self._sequence = 0

    def record(self, amount: Decimal) -> Receipt:
        if amount <= 0:
            raise ValueError("Amount must be positive.")
        self._sequence += 1
        receipt = Receipt(f"{self._prefix}-{self._sequence}", amount)
        self._refundable.add(receipt.transaction_id)
        return receipt

    def reverse(self, receipt: Receipt) -> None:
        if receipt.transaction_id not in self._refundable:
            raise LookupError(f"Unknown transaction {receipt.transaction_id}.")
        self._refundable.remove(receipt.transaction_id)


class CreditCardPayment:
    name = "card"

    def __init__(self) -> None:
        self._ledger = _PaymentLedger(self.name)

    def charge(self, amount: Decimal) -> Receipt:
        return self._ledger.record(amount)

    def refund(self, receipt: Receipt) -> None:
        self._ledger.reverse(receipt)


class PayPalPayment:
    name = "paypal"

    def __init__(self) -> None:
        self._ledger = _PaymentLedger(self.name)

    def charge(self, amount: Decimal) -> Receipt:
        return self._ledger.record(amount)

    def refund(self, receipt: Receipt) -> None:
        self._ledger.reverse(receipt)


class GiftCardPayment:
    """✅ Only promises what it can deliver: it can be charged."""

    name = "giftcard"

    def __init__(self) -> None:
        self._ledger = _PaymentLedger(self.name)

    def charge(self, amount: Decimal) -> Receipt:
        return self._ledger.record(amount)


class PaymentProcessor:
    """Works with every payment method, no isinstance checks needed."""

    def pay(self, method: PaymentMethod, amount: Decimal) -> Receipt:
        return method.charge(amount)


class RefundService:
    """✅ Asks only for refundable methods: mypy rejects a gift card here."""

    def refund_order(self, method: RefundablePaymentMethod, receipt: Receipt) -> None:
        method.refund(receipt)
