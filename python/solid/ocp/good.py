"""OCP - the solution: a stable calculator plus pluggable discount policies."""

from collections.abc import Iterable
from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal
from enum import Enum
from typing import Protocol


class CustomerTier(Enum):
    REGULAR = "regular"
    PREMIUM = "premium"
    VIP = "vip"


@dataclass(frozen=True)
class Cart:
    tier: CustomerTier
    subtotal: Decimal
    item_count: int


class DiscountPolicy(Protocol):
    """The extension point: new promotions are new classes, not edits."""

    def discount_for(self, cart: Cart) -> Decimal: ...


@dataclass(frozen=True)
class TierDiscount:
    tier: CustomerTier
    rate: Decimal

    def discount_for(self, cart: Cart) -> Decimal:
        return cart.subtotal * self.rate if cart.tier is self.tier else Decimal(0)


@dataclass(frozen=True)
class BulkDiscount:
    minimum_items: int
    rate: Decimal

    def discount_for(self, cart: Cart) -> Decimal:
        return cart.subtotal * self.rate if cart.item_count >= self.minimum_items else Decimal(0)


def default_discounts() -> list[DiscountPolicy]:
    return [
        TierDiscount(CustomerTier.PREMIUM, Decimal("0.10")),
        TierDiscount(CustomerTier.VIP, Decimal("0.20")),
        BulkDiscount(minimum_items=10, rate=Decimal("0.05")),
    ]


class DiscountCalculator:
    """✅ Applies the best available policy without knowing which ones exist."""

    def __init__(self, policies: Iterable[DiscountPolicy]) -> None:
        self._policies = tuple(policies)

    def calculate_discount(self, cart: Cart) -> Decimal:
        best = max((policy.discount_for(cart) for policy in self._policies), default=Decimal(0))
        bounded = min(max(best, Decimal(0)), cart.subtotal)
        return bounded.quantize(Decimal("0.01"), ROUND_HALF_UP)
