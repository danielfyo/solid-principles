import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PaymentGateway } from './dip/good/payment-gateway';
import { STRIPE_CLIENT, StripePaymentGateway } from './dip/good/stripe-payment-gateway';
import { defaultPaymentOptions } from './ocp/good/payment-registry';
import { OrderApi } from './srp/good/order-api';
import { Order } from './srp/types';

/** Demo data source so the gallery runs without a backend. */
class DemoOrderApi {
  load(orderId: string): Observable<Order> {
    return of({
      id: orderId,
      lines: [
        { sku: 'BOOK', name: 'Clean Architecture', unitPrice: 3200, quantity: 1 },
        { sku: 'MUG', name: 'SOLID mug', unitPrice: 1200, quantity: 2 },
      ],
    });
  }
}

/**
 * Composition root: the ONLY place that knows which concrete implementations are used.
 * Swap the Stripe client for the real SDK, a sandbox, or a fake for demos.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    { provide: OrderApi, useClass: DemoOrderApi },
    ...defaultPaymentOptions,
    { provide: PaymentGateway, useClass: StripePaymentGateway },
    {
      provide: STRIPE_CLIENT,
      useValue: {
        createCharge: async (email: string, cents: number) => {
          console.log(`[demo stripe] charging ${cents} cents to ${email}`);
          return `ch_demo_${Date.now()}`;
        },
      },
    },
  ],
};
