import type { Order } from "../types";

/**
 * ❌ ISP violation: it needs a name and a tier, but demands a whole Order.
 * - It re-renders/breaks whenever ANY part of Order changes shape.
 * - It cannot be reused where there is no order (profile page, admin list...).
 * - Tests and stories must build a full Order fixture.
 */
export function CustomerBadge({ order }: { order: Order }) {
  const isVip = order.customer.tier === "vip";
  return (
    <span className={isVip ? "badge badge-vip" : "badge"}>
      {order.customer.name}
      {isVip && " ★ VIP"}
    </span>
  );
}
