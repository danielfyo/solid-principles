import type { Order } from "../types";
import { CustomerBadge } from "./CustomerBadge";

/** The parent that owns the rich object maps it to the narrow props. */
export function OrderHeader({ order }: { order: Pick<Order, "id" | "customer"> }) {
  return (
    <header>
      <h2>Order {order.id}</h2>
      <CustomerBadge name={order.customer.name} isVip={order.customer.tier === "vip"} />
    </header>
  );
}
