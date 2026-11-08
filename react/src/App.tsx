import { CheckoutButton } from "./dip/good/CheckoutButton";
import { CustomerBadge } from "./isp/good/CustomerBadge";
import { IconButton, PrimaryButton } from "./lsp/good/Buttons";
import { PaymentOptions } from "./ocp/good/PaymentOptions";
import { defaultPaymentOptions } from "./ocp/good/paymentRegistry";
import { OrderSummary } from "./srp/good/OrderSummary";
import type { LoadOrder } from "./srp/good/orderApi";

const demoOrder: LoadOrder = async (orderId) => ({
  id: orderId,
  lines: [
    { sku: "BOOK", name: "Clean Architecture", unitPrice: 3200, quantity: 1 },
    { sku: "MUG", name: "SOLID mug", unitPrice: 1200, quantity: 2 },
  ],
});

/** A gallery of the ✅ components, all wired in main.tsx (the composition root). */
export function App() {
  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 640, margin: "2rem auto", lineHeight: 1.5 }}>
      <h1>SOLID in React</h1>

      <h2>S — Single Responsibility</h2>
      <OrderSummary orderId="A-1" loadOrder={demoOrder} />

      <h2>O — Open/Closed</h2>
      <PaymentOptions options={defaultPaymentOptions} />

      <h2>L — Liskov Substitution</h2>
      <PrimaryButton onClick={() => alert("Added!")}>Add to cart</PrimaryButton>{" "}
      <IconButton icon="🛒" disabled>
        Out of stock
      </IconButton>

      <h2>I — Interface Segregation</h2>
      <CustomerBadge name="Ana" isVip />

      <h2>D — Dependency Inversion</h2>
      <CheckoutButton email="ana@example.com" amount={5600} />
    </main>
  );
}
