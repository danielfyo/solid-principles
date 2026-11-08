// OCP - the problem: every new promotion means editing the same function.

export type Cents = number;
export type CustomerTier = "regular" | "premium" | "vip";

export interface Cart {
  readonly tier: CustomerTier;
  readonly subtotal: Cents;
  readonly itemCount: number;
}

/** ❌ Grows a new branch for every promotion marketing invents. */
export function calculateDiscount(cart: Cart): Cents {
  let discount: Cents;
  switch (cart.tier) {
    case "regular":
      discount = 0;
      break;
    case "premium":
      discount = cart.subtotal * 0.1;
      break;
    case "vip":
      discount = cart.subtotal * 0.2;
      break;
  }

  // Marketing asked for a bulk discount... so we patched it in here.
  // Next month: Black Friday, coupons, first purchase... more edits.
  if (cart.itemCount >= 10) {
    discount = Math.max(discount, cart.subtotal * 0.05);
  }
  return Math.round(discount);
}
