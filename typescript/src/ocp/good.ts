// OCP - the solution: a stable calculator plus pluggable discount policies.

export type Cents = number;
export type CustomerTier = "regular" | "premium" | "vip";

export interface Cart {
  readonly tier: CustomerTier;
  readonly subtotal: Cents;
  readonly itemCount: number;
}

/** The extension point: new promotions are new implementations, not edits. */
export interface DiscountPolicy {
  discountFor(cart: Cart): Cents;
}

export class TierDiscount implements DiscountPolicy {
  constructor(
    private readonly tier: CustomerTier,
    private readonly rate: number,
  ) {}

  discountFor(cart: Cart): Cents {
    return cart.tier === this.tier ? cart.subtotal * this.rate : 0;
  }
}

export class BulkDiscount implements DiscountPolicy {
  constructor(
    private readonly minimumItems: number,
    private readonly rate: number,
  ) {}

  discountFor(cart: Cart): Cents {
    return cart.itemCount >= this.minimumItems ? cart.subtotal * this.rate : 0;
  }
}

export const defaultDiscounts = (): DiscountPolicy[] => [
  new TierDiscount("premium", 0.1),
  new TierDiscount("vip", 0.2),
  new BulkDiscount(10, 0.05),
];

/** ✅ Applies the best policy without knowing which policies exist. */
export class DiscountCalculator {
  private readonly policies: readonly DiscountPolicy[];

  constructor(policies: Iterable<DiscountPolicy>) {
    this.policies = [...policies];
  }

  calculateDiscount(cart: Cart): Cents {
    const best = Math.max(0, ...this.policies.map((policy) => policy.discountFor(cart)));
    return Math.round(Math.min(best, cart.subtotal));
  }
}
