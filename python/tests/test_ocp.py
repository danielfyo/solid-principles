from decimal import Decimal

import pytest

from solid.ocp import bad
from solid.ocp.good import Cart, CustomerTier, DiscountCalculator, default_discounts

CASES = [
    ("REGULAR", "100", 1, "0"),
    ("PREMIUM", "100", 1, "10"),
    ("VIP", "100", 12, "20"),
    ("REGULAR", "100", 12, "5"),
]


@pytest.mark.parametrize(("tier", "subtotal", "items", "expected"), CASES)
def test_good_calculator_applies_the_best_policy(
    tier: str, subtotal: str, items: int, expected: str
) -> None:
    calculator = DiscountCalculator(default_discounts())
    cart = Cart(CustomerTier[tier], Decimal(subtotal), items)

    assert calculator.calculate_discount(cart) == Decimal(expected)


@pytest.mark.parametrize(("tier", "subtotal", "items", "expected"), CASES)
def test_bad_calculator_gives_the_same_results_today(
    tier: str, subtotal: str, items: int, expected: str
) -> None:
    cart = bad.Cart(bad.CustomerTier[tier], Decimal(subtotal), items)

    assert bad.DiscountCalculator().calculate_discount(cart) == Decimal(expected)


class FlatCouponDiscount:
    """A brand-new promotion, written without touching any production class."""

    def __init__(self, amount: Decimal) -> None:
        self._amount = amount

    def discount_for(self, cart: Cart) -> Decimal:
        return self._amount


def test_new_policies_extend_behaviour_without_modifying_the_calculator() -> None:
    calculator = DiscountCalculator([*default_discounts(), FlatCouponDiscount(Decimal(15))])

    cart = Cart(CustomerTier.PREMIUM, Decimal(100), 1)
    assert calculator.calculate_discount(cart) == Decimal(15)


def test_discount_never_exceeds_the_subtotal() -> None:
    calculator = DiscountCalculator([FlatCouponDiscount(Decimal(50))])

    cart = Cart(CustomerTier.REGULAR, Decimal(30), 1)
    assert calculator.calculate_discount(cart) == Decimal(30)
