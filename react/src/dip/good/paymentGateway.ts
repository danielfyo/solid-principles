import type { Cents } from "../../shared/money";

/** ✅ The abstraction belongs to the app, written in business language. */
export type PaymentResult =
  | { readonly succeeded: true; readonly transactionId: string }
  | { readonly succeeded: false; readonly error: string };

export interface PaymentGateway {
  charge(customerEmail: string, amount: Cents): Promise<PaymentResult>;
}
