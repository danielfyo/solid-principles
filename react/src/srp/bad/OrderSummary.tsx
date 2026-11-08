import { useEffect, useState } from "react";
import type { Order } from "../types";

/**
 * ❌ SRP violation: this component fetches data, manages loading/error state,
 * computes taxes, formats currency AND renders markup. A change to the API,
 * the tax rules, the locale or the design all land in the same file.
 */
export function OrderSummary({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/orders/${orderId}`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<Order>;
      })
      .then((data) => !cancelled && setOrder(data))
      .catch((e: unknown) => !cancelled && setError(String(e)));
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (error) return <p role="alert">Could not load order: {error}</p>;
  if (!order) return <p>Loading…</p>;

  const subtotal = order.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const tax = Math.round(subtotal * 0.21);
  const fmt = (cents: number) =>
    new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(cents / 100);

  return (
    <section aria-label="Order summary">
      <h2>Order {order.id}</h2>
      <ul>
        {order.lines.map((l) => (
          <li key={l.sku}>
            {l.quantity} × {l.name} — {fmt(l.unitPrice * l.quantity)}
          </li>
        ))}
      </ul>
      <p>Subtotal: {fmt(subtotal)}</p>
      <p>Tax: {fmt(tax)}</p>
      <p>
        <strong>Total: {fmt(subtotal + tax)}</strong>
      </p>
    </section>
  );
}
