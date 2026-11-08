import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckoutButton as BadCheckoutButton } from "./bad/CheckoutButton";
import { CheckoutButton } from "./good/CheckoutButton";
import type { PaymentGateway } from "./good/paymentGateway";
import { ServicesProvider } from "./good/ServicesContext";
import { StripePaymentGateway } from "./good/stripePaymentGateway";

// The bad component can only be tested by hijacking the module system.
vi.mock("./bad/stripeClient", () => ({
  stripeClient: { createCharge: vi.fn().mockResolvedValue("ch_mocked") },
}));

describe("DIP - the problem", () => {
  it("needs vi.mock on a module path to avoid the real SDK", async () => {
    render(<BadCheckoutButton email="ana@example.com" amount={2420} />);

    await userEvent.click(screen.getByRole("button", { name: "Pay €24.20" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Paid €24.20 (ch_mocked)");
  });
});

describe("DIP - the solution", () => {
  const renderWith = (payments: PaymentGateway) =>
    render(
      <ServicesProvider services={{ payments }}>
        <CheckoutButton email="ana@example.com" amount={2420} />
      </ServicesProvider>,
    );

  it("charges through the injected gateway", async () => {
    const charge = vi.fn<PaymentGateway["charge"]>().mockResolvedValue({ succeeded: true, transactionId: "tx_1" });
    renderWith({ charge });

    await userEvent.click(screen.getByRole("button", { name: "Pay €24.20" }));

    expect(charge).toHaveBeenCalledWith("ana@example.com", 2420);
    expect(await screen.findByRole("status")).toHaveTextContent("Paid €24.20 (tx_1)");
  });

  it("a declined payment is trivial to simulate", async () => {
    renderWith({ charge: async () => ({ succeeded: false, error: "insufficient funds" }) });

    await userEvent.click(screen.getByRole("button"));

    expect(await screen.findByRole("status")).toHaveTextContent("Payment declined: insufficient funds");
  });

  it("the Stripe adapter maps SDK failures to the app's result type", async () => {
    const gateway = new StripePaymentGateway({ createCharge: () => Promise.reject(new Error("card expired")) });

    expect(await gateway.charge("ana@example.com", 100)).toEqual({ succeeded: false, error: "Error: card expired" });
  });
});
