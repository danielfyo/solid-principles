import type { PaymentOption } from "./PaymentOptions";

function CardForm() {
  return (
    <label>
      Card number <input name="cardNumber" inputMode="numeric" />
    </label>
  );
}

function PayPalForm() {
  return <p>You will be redirected to PayPal.</p>;
}

/** The registry. Adding a method = adding an entry (or a new module that exports one). */
export const defaultPaymentOptions: readonly PaymentOption[] = [
  { id: "card", label: "Card", Form: CardForm },
  { id: "paypal", label: "PayPal", Form: PayPalForm },
];
