"""DIP - the problem: business policy creates and depends on concrete details."""

from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal


class StripeApiClient:
    """Stand-in for a third-party payment SDK (low-level detail)."""

    def __init__(self) -> None:
        self._sequence = 0

    def create_charge(self, customer_email: str, amount_in_cents: int) -> str:
        # Imagine a real HTTP call here: network, API keys, rate limits...
        print(f"[stripe] charging {amount_in_cents} cents to {customer_email}")
        self._sequence += 1
        return f"ch_{self._sequence}"


class SmtpEmailSender:
    """Stand-in for an SMTP library (low-level detail)."""

    def send(self, to: str, subject: str, body: str) -> None:
        print(f"[smtp] to={to} subject={subject} body={body}")


@dataclass(frozen=True)
class CheckoutResult:
    succeeded: bool
    message: str


class CheckoutService:
    """❌ Hard-wired to Stripe and SMTP.

    - Cannot be unit-tested without hitting "Stripe" and "SMTP".
    - Cannot simulate a declined card.
    - Switching provider means rewriting business code.
    """

    def __init__(self) -> None:
        self._stripe = StripeApiClient()
        self._email = SmtpEmailSender()

    def checkout(self, customer_email: str, amount: Decimal) -> CheckoutResult:
        cents = int((amount * 100).quantize(Decimal(1), ROUND_HALF_UP))
        charge_id = self._stripe.create_charge(customer_email, cents)

        body = f"Payment of {amount:.2f} EUR received ({charge_id})."
        self._email.send(customer_email, "Thanks for your order", body)
        return CheckoutResult(True, body)
