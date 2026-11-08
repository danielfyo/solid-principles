import { useState } from "react";
import { formatMoney, type Cents } from "../../shared/money";
import { useServices } from "./ServicesContext";

/** ✅ Depends on the PaymentGateway abstraction, injected through context. */
export function CheckoutButton({ email, amount }: { email: string; amount: Cents }) {
  const { payments } = useServices();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const pay = async () => {
    setBusy(true);
    const result = await payments.charge(email, amount);
    setStatus(
      result.succeeded
        ? `Paid ${formatMoney(amount)} (${result.transactionId})`
        : `Payment declined: ${result.error}`,
    );
    setBusy(false);
  };

  return (
    <div>
      <button type="button" onClick={pay} disabled={busy}>
        Pay {formatMoney(amount)}
      </button>
      <p role="status">{status}</p>
    </div>
  );
}
