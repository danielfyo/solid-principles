import { describe, expect, it } from "vitest";
import * as bad from "../src/ocp/bad.js";
import { DiscountCalculator, defaultDiscounts, type Cart, type DiscountPolicy } from "../src/ocp/good.js";

const cases: Array<[Cart, number]> = [
  [{ tier: "regular", subtotal: 10_000, itemCount: 1 }, 0],
  [{ tier: "premium", subtotal: 10_000, itemCount: 1 }, 1_000],
  [{ tier: "vip", subtotal: 10_000, itemCount: 12 }, 2_000],
  [{ tier: "regular", subtotal: 10_000, itemCount: 12 }, 500],
];

/** A brand-new promotion, written without touching any production code. */
const flatCoupon = (amount: number): DiscountPolicy => ({ discountFor: () => amount });

describe("OCP", () => {
  it.each(cases)("good calculator applies the best policy to %o", (cart, expected) => {
    expect(new DiscountCalculator(defaultDiscounts()).calculateDiscount(cart)).toBe(expected);
  });

  it.each(cases)("bad calculator gives the same result today for %o", (cart, expected) => {
    expect(bad.calculateDiscount(cart)).toBe(expected);
  });

  it("new policies extend behaviour without modifying the calculator", () => {
    const calculator = new DiscountCalculator([...defaultDiscounts(), flatCoupon(1_500)]);

    expect(calculator.calculateDiscount({ tier: "premium", subtotal: 10_000, itemCount: 1 })).toBe(1_500);
  });

  it("discount never exceeds the subtotal", () => {
    const calculator = new DiscountCalculator([flatCoupon(5_000)]);

    expect(calculator.calculateDiscount({ tier: "regular", subtotal: 3_000, itemCount: 1 })).toBe(3_000);
  });
});
