import { render, screen } from "@testing-library/react";
import { CustomerBadge as BadCustomerBadge } from "./bad/CustomerBadge";
import { CustomerBadge } from "./good/CustomerBadge";
import { OrderHeader } from "./good/OrderHeader";
import type { Order } from "./types";

describe("ISP", () => {
  it("the bad badge needs a full Order fixture just to show a name", () => {
    const order: Order = {
      id: "O-1",
      placedAt: "2026-03-14T10:00:00Z",
      customer: { id: "C-1", name: "Ana", email: "ana@example.com", tier: "vip", addresses: [] },
      lines: [],
      payment: { method: "card", status: "paid" },
      total: 0,
    };

    render(<BadCustomerBadge order={order} />);

    expect(screen.getByText("Ana ★ VIP")).toBeInTheDocument();
  });

  it("the good badge needs only what it shows", () => {
    render(<CustomerBadge name="Ana" isVip />);

    expect(screen.getByText("Ana ★ VIP")).toBeInTheDocument();
  });

  it("the good badge is reusable outside orders", () => {
    render(<CustomerBadge name="Luis" isVip={false} />);

    expect(screen.getByText("Luis")).not.toHaveClass("badge-vip");
  });

  it("the parent maps the rich object to narrow props", () => {
    render(<OrderHeader order={{ id: "O-1", customer: { id: "C-1", name: "Ana", email: "", tier: "vip", addresses: [] } }} />);

    expect(screen.getByRole("heading")).toHaveTextContent("Order O-1");
    expect(screen.getByText("Ana ★ VIP")).toBeInTheDocument();
  });
});
