import { describe, expect, it } from "vitest";
import * as bad from "../src/srp/bad.js";
import {
  InvalidOrderError,
  OrderConfirmationNotifier,
  OrderRepository,
  OrderService,
  OrderValidator,
  PriceCalculator,
  type Order,
} from "../src/srp/good.js";

const sampleOrder: Order = {
  id: "A-1",
  customerEmail: "ana@example.com",
  lines: [{ sku: "BOOK", unitPrice: 1000, quantity: 2 }],
};

const makeService = () => {
  const repository = new OrderRepository();
  const notifier = new OrderConfirmationNotifier();
  const service = new OrderService(new OrderValidator(), new PriceCalculator(0.21), repository, notifier);
  return { service, repository, notifier };
};

describe("SRP", () => {
  it("bad and good versions compute the same total", () => {
    const badTotal = new bad.OrderService().placeOrder(sampleOrder);

    expect(badTotal).toBe(2420);
    expect(new PriceCalculator(0.21).calculate(sampleOrder).total).toBe(badTotal);
  });

  it("PriceCalculator splits subtotal and tax", () => {
    expect(new PriceCalculator(0.21).calculate(sampleOrder)).toEqual({ subtotal: 2000, tax: 420, total: 2420 });
  });

  it.each([
    ["no-at-sign", 1, "Customer email is invalid."],
    ["ana@example.com", 0, "Quantities must be positive."],
  ])("OrderValidator rejects %s with quantity %i", (customerEmail, quantity, expected) => {
    const order: Order = { id: "A-2", customerEmail, lines: [{ sku: "BOOK", unitPrice: 1000, quantity }] };

    expect(() => new OrderValidator().ensureValid(order)).toThrowError(new InvalidOrderError(expected));
  });

  it("OrderService coordinates the collaborators", () => {
    const { service, repository, notifier } = makeService();

    const totals = service.placeOrder(sampleOrder);

    expect(repository.findTotals("A-1")).toEqual(totals);
    expect(notifier.sentMessages).toEqual(["To: ana@example.com | Order A-1 confirmed | Total: 24.20 EUR"]);
  });

  it("OrderService does not save or notify invalid orders", () => {
    const { service, repository, notifier } = makeService();

    expect(() => service.placeOrder({ id: "A-3", customerEmail: "ana@example.com", lines: [] })).toThrow(
      InvalidOrderError,
    );
    expect(repository.findTotals("A-3")).toBeUndefined();
    expect(notifier.sentMessages).toEqual([]);
  });
});
