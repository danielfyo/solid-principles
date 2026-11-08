import type { Order } from "../types";

export type LoadOrder = (orderId: string, signal?: AbortSignal) => Promise<Order>;

/** Single reason to change: the HTTP contract with the backend. */
export const fetchOrder: LoadOrder = async (orderId, signal) => {
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, signal ? { signal } : {});
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as Order;
};
