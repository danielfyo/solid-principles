"""OCP - the problem: every new promotion means editing the same function."""

from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal
from enum import Enum


class CustomerTier(Enum):
    REGULAR = "regular"
    PREMIUM = "premium"
    VIP = "vip"


@dataclass(frozen=True)
class Cart:
    tier: CustomerTier
    subtotal: Decimal
    item_count: int


class DiscountCalculator:
    """❌ Closed for extension, open for (endless) modification."""

    def calculate_discount(self, cart: Cart) -> Decimal:
        match cart.tier:
            case CustomerTier.REGULAR:
                discount = Decimal(0)
            case CustomerTier.PREMIUM:
                discount = cart.subtotal * Decimal("0.10")
            case CustomerTier.VIP:
                discount = cart.subtotal * Decimal("0.20")

        # Marketing asked for a bulk discount... so we patched it in here.
        # Next month: Black Friday, coupons, first purchase... more edits.
        if cart.item_count >= 10:
            discount = max(discount, cart.subtotal * Decimal("0.05"))

        return discount.quantize(Decimal("0.01"), ROUND_HALF_UP)
