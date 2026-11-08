import { formatMoney } from "../../shared/money";
import type { Order } from "../types";
import type { OrderTotals } from "./orderTotals";

interface OrderSummaryViewProps {
  readonly order: Order;
  readonly totals: OrderTotals;
}

/** Single reason to change: how the summary looks. Pure, props in → markup out. */
export function OrderSummaryView({ order, totals }: OrderSummaryViewProps) {
  return (
    <section aria-label="Order summary">
      <h2>Order {order.id}</h2>
      <ul>
        {order.lines.map((line) => (
          <li key={line.sku}>
            {line.quantity} × {line.name} — {formatMoney(line.unitPrice * line.quantity)}
          </li>
        ))}
      </ul>
      <p>Subtotal: {formatMoney(totals.subtotal)}</p>
      <p>Tax: {formatMoney(totals.tax)}</p>
      <p>
        <strong>Total: {formatMoney(totals.total)}</strong>
      </p>
    </section>
  );
}
