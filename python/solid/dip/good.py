"""DIP - the solution: policy owns abstractions; details plug into them."""

from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal
from typing import Protocol

# --- Abstractions owned by the high-level policy ---------------------------


@dataclass(frozen=True)
class PaymentResult:
    succeeded: bool
    transaction_id: str | None = None
    error: str | None = None

    @staticmethod
    def approved(transaction_id: str) -> "PaymentResult":
        return PaymentResult(True, transaction_id=transaction_id)

    @staticmethod
    def declined(reason: str) -> "PaymentResult":
        return PaymentResult(False, error=reason)


class PaymentGateway(Protocol):
    def charge(self, customer_email: str, amount: Decimal) -> PaymentResult: ...


class CustomerNotifier(Protocol):
    def notify(self, customer_email: str, message: str) -> None: ...


@dataclass(frozen=True)
class CheckoutResult:
    succeeded: bool
    message: str


class CheckoutService:
    """✅ Depends only on abstractions; knows nothing about Stripe or SMTP."""

    def __init__(self, payments: PaymentGateway, notifier: CustomerNotifier) -> None:
        self._payments = payments
        self._notifier = notifier

    def checkout(self, customer_email: str, amount: Decimal) -> CheckoutResult:
        payment = self._payments.charge(customer_email, amount)
        if not payment.succeeded:
            return CheckoutResult(False, f"Payment declined: {payment.error}")

        message = f"Payment of {amount:.2f} EUR received ({payment.transaction_id})."
        self._notifier.notify(customer_email, message)
        return CheckoutResult(True, message)


# --- Low-level details (infrastructure) -------------------------------------


class StripeApiClient:
    """Stand-in for a third-party payment SDK. We do not control its API."""

    def __init__(self) -> None:
        self._sequence = 0

    def create_charge(self, customer_email: str, amount_in_cents: int) -> str:
        print(f"[stripe] charging {amount_in_cents} cents to {customer_email}")
        self._sequence += 1
        return f"ch_{self._sequence}"


class SmtpEmailSender:
    def send(self, to: str, subject: str, body: str) -> None:
        print(f"[smtp] to={to} subject={subject} body={body}")


class StripePaymentGateway:
    """✅ Adapter: the detail depends on (implements) the policy's abstraction."""

    def __init__(self, client: StripeApiClient) -> None:
        self._client = client

    def charge(self, customer_email: str, amount: Decimal) -> PaymentResult:
        cents = int((amount * 100).quantize(Decimal(1), ROUND_HALF_UP))
        return PaymentResult.approved(self._client.create_charge(customer_email, cents))


class EmailCustomerNotifier:
    def __init__(self, smtp: SmtpEmailSender) -> None:
        self._smtp = smtp

    def notify(self, customer_email: str, message: str) -> None:
        self._smtp.send(customer_email, "Thanks for your order", message)


# --- Composition root: the only place that knows the concrete classes ----------


def create_checkout_service() -> CheckoutService:
    return CheckoutService(
        StripePaymentGateway(StripeApiClient()),
        EmailCustomerNotifier(SmtpEmailSender()),
    )
