import { useState } from "react";
import { formatMoney, type Cents } from "../../shared/money";
import { stripeClient } from "./stripeClient";

/**
 * ❌ DIP violation: a UI/business component imports a concrete vendor SDK.
 * - Tests must hijack the module system (vi.mock) to avoid "real" charges.
 * - Storybook, demos and other providers are impossible without editing it.
 */
export function CheckoutButton({ email, amount }: { email: string; amount: Cents }) {
  const [status, setStatus] = useState("");

  const pay = async () => {
    const chargeId = await stripeClient.createCharge(email, amount);
    setStatus(`Paid ${formatMoney(amount)} (${chargeId})`);
  };

  return (
    <div>
      <button type="button" onClick={pay}>
        Pay {formatMoney(amount)}
      </button>
      <p role="status">{status}</p>
    </div>
  );
}
