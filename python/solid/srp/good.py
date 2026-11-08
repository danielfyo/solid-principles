"""SRP - the solution: one class per reason to change, plus a thin coordinator."""

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


@dataclass(frozen=True)
class OrderTotals:
    subtotal: Decimal
    tax: Decimal
    total: Decimal


class InvalidOrderError(ValueError):
    """Raised when an order breaks a business rule."""


class OrderValidator:
    """Single reason to change: the business rules that define a valid order."""

    def ensure_valid(self, order: Order) -> None:
        if not order.lines:
            raise InvalidOrderError("An order needs at least one line.")
        if any(line.quantity <= 0 for line in order.lines):
            raise InvalidOrderError("Quantities must be positive.")
        if "@" not in order.customer_email:
            raise InvalidOrderError("Customer email is invalid.")


class PriceCalculator:
    """Single reason to change: how finance computes money."""

    def __init__(self, tax_rate: Decimal) -> None:
        self._tax_rate = tax_rate

    def calculate(self, order: Order) -> OrderTotals:
        subtotal = sum((line.unit_price * line.quantity for line in order.lines), Decimal(0))
        tax = (subtotal * self._tax_rate).quantize(Decimal("0.01"), ROUND_HALF_UP)
        return OrderTotals(subtotal=subtotal, tax=tax, total=subtotal + tax)


class OrderRepository:
    """Single reason to change: how orders are stored."""

    def __init__(self) -> None:
        self._orders: dict[str, OrderTotals] = {}

    def save(self, order: Order, totals: OrderTotals) -> None:
        self._orders[order.id] = totals

    def find_totals(self, order_id: str) -> OrderTotals | None:
        return self._orders.get(order_id)


class OrderConfirmationNotifier:
    """Single reason to change: what the customer is told and how."""

    def __init__(self) -> None:
        self.sent_messages: list[str] = []

    def notify_order_placed(self, order: Order, totals: OrderTotals) -> None:
        self.sent_messages.append(
            f"To: {order.customer_email} | Order {order.id} confirmed | "
            f"Total: {totals.total:.2f} EUR"
        )


class OrderService:
    """✅ Only coordinates the workflow; every decision lives in a collaborator."""

    def __init__(
        self,
        validator: OrderValidator,
        calculator: PriceCalculator,
        repository: OrderRepository,
        notifier: OrderConfirmationNotifier,
    ) -> None:
        self._validator = validator
        self._calculator = calculator
        self._repository = repository
        self._notifier = notifier

    def place_order(self, order: Order) -> OrderTotals:
        self._validator.ensure_valid(order)
        totals = self._calculator.calculate(order)
        self._repository.save(order, totals)
        self._notifier.notify_order_placed(order, totals)
        return totals
