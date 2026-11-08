import { render, screen } from "@testing-library/react";
import { OrderSummary as BadOrderSummary } from "./bad/OrderSummary";
import { OrderSummary } from "./good/OrderSummary";
import { OrderSummaryView } from "./good/OrderSummaryView";
import { calculateTotals } from "./good/orderTotals";
import type { Order } from "./types";

const order: Order = { id: "A-1", lines: [{ sku: "BOOK", name: "Clean Code", unitPrice: 1000, quantity: 2 }] };

describe("SRP - the problem", () => {
  it("can only be tested by stubbing the global fetch", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => order }));

    render(<BadOrderSummary orderId="A-1" />);

    expect(await screen.findByText("Total: €24.20")).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});

describe("SRP - the solution", () => {
  it("pricing is a pure function", () => {
    expect(calculateTotals(order, 0.21)).toEqual({ subtotal: 2000, tax: 420, total: 2420 });
  });

  it("the view renders from props alone", () => {
    render(<OrderSummaryView order={order} totals={{ subtotal: 2000, tax: 420, total: 2420 }} />);

    expect(screen.getByText("2 × Clean Code — €20.00")).toBeInTheDocument();
    expect(screen.getByText("Total: €24.20")).toBeInTheDocument();
  });

  it("the container composes the pieces with an injected loader", async () => {
    render(<OrderSummary orderId="A-1" loadOrder={async () => order} />);

    expect(await screen.findByText("Total: €24.20")).toBeInTheDocument();
  });

  it("shows loading errors", async () => {
    render(<OrderSummary orderId="A-1" loadOrder={() => Promise.reject(new Error("offline"))} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("offline");
  });
});
