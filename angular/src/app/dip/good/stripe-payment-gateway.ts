import { Injectable, InjectionToken, inject } from '@angular/core';
import { Cents } from '../../shared/money';
import { PaymentGateway, PaymentResult } from './payment-gateway';

/** Stand-in for a third-party SDK client. */
export interface StripeLikeClient {
  createCharge(customerEmail: string, amountInCents: Cents): Promise<string>;
}

export const STRIPE_CLIENT = new InjectionToken<StripeLikeClient>('STRIPE_CLIENT');

/** ✅ Adapter: the low-level detail implements the app's abstraction. */
@Injectable()
export class StripePaymentGateway extends PaymentGateway {
  private readonly client = inject(STRIPE_CLIENT);

  async charge(customerEmail: string, amount: Cents): Promise<PaymentResult> {
    try {
      return { succeeded: true, transactionId: await this.client.createCharge(customerEmail, amount) };
    } catch (error) {
      return { succeeded: false, error: String(error) };
    }
  }
}
