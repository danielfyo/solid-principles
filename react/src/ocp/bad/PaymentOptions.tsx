import { useState } from "react";

type PaymentMethodId = "card" | "paypal";

/**
 * ❌ OCP violation: supporting a new payment method (Bizum, Apple Pay...) means
 * editing this component: the type union, the radio list AND the switch.
 */
export function PaymentOptions() {
  const [selected, setSelected] = useState<PaymentMethodId>("card");

  const renderForm = () => {
    switch (selected) {
      case "card":
        return (
          <label>
            Card number <input name="cardNumber" inputMode="numeric" />
          </label>
        );
      case "paypal":
        return <p>You will be redirected to PayPal.</p>;
    }
  };

  return (
    <fieldset>
      <legend>Payment method</legend>
      <label>
        <input type="radio" checked={selected === "card"} onChange={() => setSelected("card")} /> Card
      </label>
      <label>
        <input type="radio" checked={selected === "paypal"} onChange={() => setSelected("paypal")} /> PayPal
      </label>
      {renderForm()}
    </fieldset>
  );
}
