"""LSP - the problem: a subclass that cannot keep the base class promise."""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class Receipt:
    transaction_id: str
    amount: Decimal


class PaymentMethod(ABC):
    """Promises that every payment method can be charged AND refunded."""

    def __init__(self) -> None:
        self._issued: set[str] = set()
        self._sequence = 0

    @property
    @abstractmethod
    def name(self) -> str: ...

    def charge(self, amount: Decimal) -> Receipt:
        if amount <= 0:
            raise ValueError("Amount must be positive.")
        self._sequence += 1
        receipt = Receipt(f"{self.name}-{self._sequence}", amount)
        self._issued.add(receipt.transaction_id)
        return receipt

    def refund(self, receipt: Receipt) -> None:
        if receipt.transaction_id not in self._issued:
            raise LookupError(f"Unknown transaction {receipt.transaction_id}.")
        self._issued.remove(receipt.transaction_id)


class CreditCardPayment(PaymentMethod):
    @property
    def name(self) -> str:
        return "card"


class PayPalPayment(PaymentMethod):
    @property
    def name(self) -> str:
        return "paypal"


class GiftCardPayment(PaymentMethod):
    """❌ IS-A PaymentMethod by inheritance, but breaks the refund promise."""

    @property
    def name(self) -> str:
        return "giftcard"

    def refund(self, receipt: Receipt) -> None:
        raise NotImplementedError("Gift card payments cannot be refunded.")


class RefundService:
    """Written against the base type, as it should be... and it still breaks."""

    def refund_order(self, method: PaymentMethod, receipt: Receipt) -> None:
        method.refund(receipt)  # 💥 NotImplementedError at runtime for gift cards
