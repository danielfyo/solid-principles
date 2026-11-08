import { describe, expect, it, vi } from "vitest";
import {
  CheckoutService,
  createCheckoutService,
  type CustomerNotifier,
  type PaymentGateway,
  type PaymentResult,
} from "../src/dip/good.js";

const fakeGateway = (result: PaymentResult) => {
  const charges: Array<[string, number]> = [];
  const gateway: PaymentGateway = {
    charge: async (email, amount) => {
      charges.push([email, amount]);
      return result;
    },
  };
  return { gateway, charges };
};

const spyNotifier = () => {
  const messages: string[] = [];
  const notifier: CustomerNotifier = {
    notify: async (email, message) => {
      messages.push(`${email}: ${message}`);
    },
  };
  return { notifier, messages };
};

describe("DIP", () => {
  it("successful checkout notifies the customer", async () => {
    const { gateway, charges } = fakeGateway({ succeeded: true, transactionId: "tx_1" });
    const { notifier, messages } = spyNotifier();

    const result = await new CheckoutService(gateway, notifier).checkout("ana@example.com", 2_420);

    expect(result.succeeded).toBe(true);
    expect(charges).toEqual([["ana@example.com", 2_420]]);
    expect(messages).toEqual(["ana@example.com: Payment of 24.20 EUR received (tx_1)."]);
  });

  it("declined payment is easy to simulate and sends nothing", async () => {
    const { gateway } = fakeGateway({ succeeded: false, error: "insufficient funds" });
    const { notifier, messages } = spyNotifier();

    const result = await new CheckoutService(gateway, notifier).checkout("ana@example.com", 2_420);

    expect(result).toEqual({ succeeded: false, message: "Payment declined: insufficient funds" });
    expect(messages).toEqual([]);
  });

  it("composition root wires the real adapters", async () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);

    const result = await createCheckoutService().checkout("ana@example.com", 1_000);

    expect(result.message).toBe("Payment of 10.00 EUR received (ch_1).");
  });
});
