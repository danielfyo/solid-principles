from datetime import date
from decimal import Decimal

import pytest

from solid.isp import bad
from solid.isp.good import (
    ArchivedOrderStore,
    InMemoryOrderStore,
    InvoicePrinter,
    SalesDashboard,
    StoredOrder,
)

MARCH = StoredOrder("O-1", "Ana", Decimal("120.00"), date(2026, 3, 14))
MARCH_TOO = StoredOrder("O-2", "Luis", Decimal("30.50"), date(2026, 3, 20))
APRIL = StoredOrder("O-3", "Eva", Decimal("99.99"), date(2026, 4, 2))


def test_bad_fat_interface_forces_the_archive_to_lie() -> None:
    with pytest.raises(NotImplementedError):
        bad.ArchivedOrderStore([]).delete("O-1")


class StubReader:
    """With a narrow interface, a test double is tiny."""

    def get_by_id(self, order_id: str) -> StoredOrder | None:
        return MARCH if order_id == MARCH.id else None


def test_invoice_printer_only_needs_a_reader() -> None:
    printer = InvoicePrinter(StubReader())

    assert printer.print("O-1") == "Invoice O-1 | Ana | 120.00 EUR"
    with pytest.raises(LookupError):
        printer.print("missing")


def test_read_only_archive_works_with_reading_and_reporting_clients() -> None:
    archive = ArchivedOrderStore([MARCH, MARCH_TOO, APRIL])

    assert InvoicePrinter(archive).print("O-3") == "Invoice O-3 | Eva | 99.99 EUR"
    assert SalesDashboard(archive).monthly_summary(2026, 3) == "2026-03: 150.50 EUR"


def test_live_store_plays_every_role() -> None:
    store = InMemoryOrderStore()
    store.save(MARCH)
    store.save(APRIL)
    store.delete("O-3")

    assert store.get_by_id("O-1") is not None
    assert store.get_by_id("O-3") is None
    assert store.total_sales_for(2026, 4) == Decimal(0)
