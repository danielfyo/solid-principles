import type { LoadOrder } from "./orderApi";
import { calculateTotals } from "./orderTotals";
import { OrderSummaryView } from "./OrderSummaryView";
import { useOrder } from "./useOrder";

const TAX_RATE = 0.21;

interface OrderSummaryProps {
  readonly orderId: string;
  readonly loadOrder?: LoadOrder;
}

/** ✅ A thin container: wires the hook, the pricing function and the view. */
export function OrderSummary({ orderId, loadOrder }: OrderSummaryProps) {
  const state = useOrder(orderId, loadOrder);

  if (state.status === "loading") return <p>Loading…</p>;
  if (state.status === "error") return <p role="alert">Could not load order: {state.message}</p>;

  return <OrderSummaryView order={state.order} totals={calculateTotals(state.order, TAX_RATE)} />;
}
