import type { Cents } from "../shared/money";

/** A rich domain object, as it typically comes from the API. */
export interface Order {
  readonly id: string;
  readonly placedAt: string;
  readonly customer: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly tier: "regular" | "premium" | "vip";
    readonly addresses: readonly { readonly street: string; readonly city: string }[];
  };
  readonly lines: readonly { readonly sku: string; readonly quantity: number; readonly unitPrice: Cents }[];
  readonly payment: { readonly method: string; readonly status: "pending" | "paid" | "refunded" };
  readonly total: Cents;
}
