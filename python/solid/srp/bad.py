"""SRP - the problem: one class with four reasons to change."""

from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal


@dataclass(frozen=True)
class OrderLine:
    sku: str
    unit_price: Decimal
    quantity: int


@dataclass(frozen=True)
class Order:
    id: str
    customer_email: str
    lines: tuple[OrderLine, ...]


class OrderService:
    """❌ Validates, prices, persists AND notifies.

    Four different actors (product owner, finance, DBA, marketing) can each
    force a change here, and every change risks breaking the other three jobs.
    """

    TAX_RATE = Decimal("0.21")

    def __init__(self) -> None:
        self.orders_table: dict[str, Decimal] = {}
        self.sent_emails: list[str] = []

    def place_order(self, order: Order) -> Decimal:
        # 1) Business rules (product owner)
        if not order.lines:
            raise ValueError("An order needs at least one line.")
        if any(line.quantity <= 0 for line in order.lines):
            raise ValueError("Quantities must be positive.")
        if "@" not in order.customer_email:
            raise ValueError("Customer email is invalid.")

        # 2) Pricing and taxes (finance)
        subtotal = sum((line.unit_price * line.quantity for line in order.lines), Decimal(0))
        total = (subtotal * (1 + self.TAX_RATE)).quantize(Decimal("0.01"), ROUND_HALF_UP)

        # 3) Persistence (DBA / infrastructure)
        self.orders_table[order.id] = total

        # 4) Notification wording and delivery (marketing)
        self.sent_emails.append(
            f"To: {order.customer_email} | Order {order.id} confirmed | Total: {total:.2f} EUR"
        )
        return total
