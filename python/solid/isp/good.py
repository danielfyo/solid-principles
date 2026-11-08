"""ISP - the solution: small role interfaces shaped by each client's needs."""

from collections.abc import Iterable
from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from typing import Protocol


@dataclass(frozen=True)
class StoredOrder:
    id: str
    customer_name: str
    total: Decimal
    placed_on: date


class OrderReader(Protocol):
    def get_by_id(self, order_id: str) -> StoredOrder | None: ...


class OrderWriter(Protocol):
    def save(self, order: StoredOrder) -> None: ...

    def delete(self, order_id: str) -> None: ...


class SalesStatistics(Protocol):
    def total_sales_for(self, year: int, month: int) -> Decimal: ...


def _total_sales(orders: Iterable[StoredOrder], year: int, month: int) -> Decimal:
    return sum(
        (o.total for o in orders if o.placed_on.year == year and o.placed_on.month == month),
        Decimal(0),
    )


class InMemoryOrderStore:
    """A full-featured store simply satisfies every role."""

    def __init__(self) -> None:
        self._orders: dict[str, StoredOrder] = {}

    def get_by_id(self, order_id: str) -> StoredOrder | None:
        return self._orders.get(order_id)

    def save(self, order: StoredOrder) -> None:
        self._orders[order.id] = order

    def delete(self, order_id: str) -> None:
        self._orders.pop(order_id, None)

    def total_sales_for(self, year: int, month: int) -> Decimal:
        return _total_sales(self._orders.values(), year, month)


class ArchivedOrderStore:
    """✅ Implements only what it can honestly do: read and report."""

    def __init__(self, orders: Iterable[StoredOrder]) -> None:
        self._orders = {order.id: order for order in orders}

    def get_by_id(self, order_id: str) -> StoredOrder | None:
        return self._orders.get(order_id)

    def total_sales_for(self, year: int, month: int) -> Decimal:
        return _total_sales(self._orders.values(), year, month)


class InvoicePrinter:
    """✅ Depends only on reading."""

    def __init__(self, orders: OrderReader) -> None:
        self._orders = orders

    def print(self, order_id: str) -> str:
        order = self._orders.get_by_id(order_id)
        if order is None:
            raise LookupError(f"Order {order_id} not found.")
        return f"Invoice {order.id} | {order.customer_name} | {order.total:.2f} EUR"


class SalesDashboard:
    """✅ Depends only on statistics."""

    def __init__(self, statistics: SalesStatistics) -> None:
        self._statistics = statistics

    def monthly_summary(self, year: int, month: int) -> str:
        total = self._statistics.total_sales_for(year, month)
        return f"{year:04d}-{month:02d}: {total:.2f} EUR"
