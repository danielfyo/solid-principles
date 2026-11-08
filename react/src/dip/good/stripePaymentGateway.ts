import type { Cents } from "../../shared/money";
import type { PaymentGateway, PaymentResult } from "./paymentGateway";

/** Stand-in for a third-party SDK client. */
export interface StripeLikeClient {
  createCharge(customerEmail: string, amountInCents: Cents): Promise<string>;
}

/** ✅ Adapter: the low-level detail implements the app's abstraction. */
export class StripePaymentGateway implements PaymentGateway {
  constructor(private readonly client: StripeLikeClient) {}

  async charge(customerEmail: string, amount: Cents): Promise<PaymentResult> {
    try {
      return { succeeded: true, transactionId: await this.client.createCharge(customerEmail, amount) };
    } catch (error) {
      return { succeeded: false, error: String(error) };
    }
  }
}
