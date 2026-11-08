import { Cents } from '../../shared/money';

/** ✅ The abstraction belongs to the app, written in business language. */
export type PaymentResult =
  | { readonly succeeded: true; readonly transactionId: string }
  | { readonly succeeded: false; readonly error: string };

/**
 * An abstract class doubles as the DI token, so components can simply
 * `inject(PaymentGateway)` without knowing which implementation is provided.
 */
export abstract class PaymentGateway {
  abstract charge(customerEmail: string, amount: Cents): Promise<PaymentResult>;
}
