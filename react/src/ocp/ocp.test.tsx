import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentOptions as BadPaymentOptions } from "./bad/PaymentOptions";
import { PaymentOptions, type PaymentOption } from "./good/PaymentOptions";
import { defaultPaymentOptions } from "./good/paymentRegistry";

describe("OCP", () => {
  it("bad and good versions behave the same today", async () => {
    for (const ui of [<BadPaymentOptions key="bad" />, <PaymentOptions key="good" options={defaultPaymentOptions} />]) {
      const { unmount } = render(ui);
      expect(screen.getByLabelText("Card number")).toBeInTheDocument();

      await userEvent.click(screen.getByLabelText("PayPal"));
      expect(screen.getByText("You will be redirected to PayPal.")).toBeInTheDocument();
      unmount();
    }
  });

  it("a new payment method is added without touching PaymentOptions", async () => {
    const bizum: PaymentOption = { id: "bizum", label: "Bizum", Form: () => <p>Enter your phone number.</p> };

    render(<PaymentOptions options={[...defaultPaymentOptions, bizum]} />);
    await userEvent.click(screen.getByLabelText("Bizum"));

    expect(screen.getByText("Enter your phone number.")).toBeInTheDocument();
  });
});
