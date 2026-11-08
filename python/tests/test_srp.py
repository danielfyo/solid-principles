from decimal import Decimal

import pytest

from solid.srp import bad
from solid.srp.good import (
    InvalidOrderError,
    Order,
    OrderConfirmationNotifier,
    OrderLine,
    OrderRepository,
    OrderService,
    OrderTotals,
    OrderValidator,
    PriceCalculator,
)

TAX = Decimal("0.21")


def sample_order() -> Order:
    return Order("A-1", "ana@example.com", (OrderLine("BOOK", Decimal("10.00"), 2),))


def make_service() -> tuple[OrderService, OrderRepository, OrderConfirmationNotifier]:
    repository, notifier = OrderRepository(), OrderConfirmationNotifier()
    service = OrderService(OrderValidator(), PriceCalculator(TAX), repository, notifier)
    return service, repository, notifier


def test_bad_and_good_versions_compute_the_same_total() -> None:
    bad_order = bad.Order("A-1", "ana@example.com", (bad.OrderLine("BOOK", Decimal("10.00"), 2),))
    bad_total = bad.OrderService().place_order(bad_order)

    assert bad_total == Decimal("24.20")
    assert PriceCalculator(TAX).calculate(sample_order()).total == bad_total


def test_price_calculator_splits_subtotal_and_tax() -> None:
    totals = PriceCalculator(TAX).calculate(sample_order())

    assert totals == OrderTotals(Decimal("20.00"), Decimal("4.20"), Decimal("24.20"))


@pytest.mark.parametrize(
    ("email", "quantity", "expected"),
    [
        ("no-at-sign", 1, "Customer email is invalid."),
        ("ana@example.com", 0, "Quantities must be positive."),
    ],
)
def test_validator_rejects_invalid_orders(email: str, quantity: int, expected: str) -> None:
    order = Order("A-2", email, (OrderLine("BOOK", Decimal(10), quantity),))

    with pytest.raises(InvalidOrderError, match=expected):
        OrderValidator().ensure_valid(order)


def test_service_coordinates_the_collaborators() -> None:
    service, repository, notifier = make_service()

    totals = service.place_order(sample_order())

    assert repository.find_totals("A-1") == totals
    assert notifier.sent_messages == [
        "To: ana@example.com | Order A-1 confirmed | Total: 24.20 EUR"
    ]


def test_service_does_not_save_or_notify_invalid_orders() -> None:
    service, repository, notifier = make_service()

    with pytest.raises(InvalidOrderError):
        service.place_order(Order("A-3", "ana@example.com", ()))

    assert repository.find_totals("A-3") is None
    assert notifier.sent_messages == []
