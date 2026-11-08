"""ISP - the problem: a fat interface that every client must depend on."""

from abc import ABC, abstractmethod
from collections.abc import Iterable
from dataclasses import dataclass
from datetime import date
from decimal import Decimal


@dataclass(frozen=True)
class StoredOrder:
    id: str
    customer_name: str
    total: Decimal
    placed_on: date


class OrderStore(ABC):
    """❌ Mixes reading, writing and reporting in one abstraction."""

    @abstractmethod
    def get_by_id(self, order_id: str) -> StoredOrder | None: ...

    @abstractmethod
    def save(self, order: StoredOrder) -> None: ...

    @abstractmethod
    def delete(self, order_id: str) -> None: ...

    @abstractmethod
    def total_sales_for(self, year: int, month: int) -> Decimal: ...


class ArchivedOrderStore(OrderStore):
    """Read-only archive forced to 'implement' writes it can never support."""

    def __init__(self, orders: Iterable[StoredOrder]) -> None:
        self._orders = {order.id: order for order in orders}

    def get_by_id(self, order_id: str) -> StoredOrder | None:
        return self._orders.get(order_id)

    def save(self, order: StoredOrder) -> None:
        raise NotImplementedError("The archive is read-only.")

    def delete(self, order_id: str) -> None:
        raise NotImplementedError("The archive is read-only.")

    def total_sales_for(self, year: int, month: int) -> Decimal:
        return sum(
            (
                o.total
                for o in self._orders.values()
                if o.placed_on.year == year and o.placed_on.month == month
            ),
            Decimal(0),
        )


class InvoicePrinter:
    """Only needs get_by_id, yet any test double must fake all four methods."""

    def __init__(self, store: OrderStore) -> None:
        self._store = store

    def print(self, order_id: str) -> str:
        order = self._store.get_by_id(order_id)
        if order is None:
            raise LookupError(f"Order {order_id} not found.")
        return f"Invoice {order.id} | {order.customer_name} | {order.total:.2f} EUR"
