import { describe, expect, it } from "vitest";
import * as bad from "../src/lsp/bad.js";
import {
  CreditCardPayment,
  GiftCardPayment,
  PaymentProcessor,
  PayPalPayment,
  RefundService,
  type PaymentMethod,
  type RefundablePaymentMethod,
} from "../src/lsp/good.js";

describe("LSP - the problem", () => {
  it("breaks callers that trust the base type", () => {
    const giftCard = new bad.GiftCardPayment();
    const receipt = giftCard.charge(2_500);

    // The caller did nothing wrong, yet substitution fails at runtime.
    expect(() => new bad.RefundService().refundOrder(giftCard, receipt)).toThrow("cannot be refunded");
  });
});

// Contract tests: ONE suite that every implementation must pass.
const allMethods: Array<[string, () => PaymentMethod]> = [
  ["card", () => new CreditCardPayment()],
  ["paypal", () => new PayPalPayment()],
  ["giftcard", () => new GiftCardPayment()],
];

const refundableMethods: Array<[string, () => RefundablePaymentMethod]> = [
  ["card", () => new CreditCardPayment()],
  ["paypal", () => new PayPalPayment()],
];

describe.each(allMethods)("PaymentMethod contract: %s", (_name, create) => {
  it("charges the exact amount", () => {
    const receipt = new PaymentProcessor().pay(create(), 4_250);

    expect(receipt.amount).toBe(4_250);
    expect(receipt.transactionId).not.toBe("");
  });

  it("rejects non-positive amounts", () => {
    expect(() => create().charge(0)).toThrow(RangeError);
  });
});

describe.each(refundableMethods)("RefundablePaymentMethod contract: %s", (_name, create) => {
  it("refunds its own receipts exactly once", () => {
    const method = create();
    const receipt = method.charge(1_000);
    const refunds = new RefundService();

    refunds.refundOrder(method, receipt);

    expect(() => refunds.refundOrder(method, receipt)).toThrow("Unknown transaction");
  });
});

describe("LSP - the solution", () => {
  it("gift cards are simply not refundable", () => {
    const giftCard = new GiftCardPayment();
    // @ts-expect-error ⛔ a GiftCardPayment is not a RefundablePaymentMethod
    const refund = () => new RefundService().refundOrder(giftCard, giftCard.charge(100));

    expect(refund).toThrow(TypeError);
  });
});
