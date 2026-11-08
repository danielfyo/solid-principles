import { InjectionToken, Provider, Type } from '@angular/core';

/** The extension point: a payment option is data + a component. */
export interface PaymentOption {
  readonly id: string;
  readonly label: string;
  readonly component: Type<unknown>;
}

/** Multi-provider token: every provided option is collected, in registration order. */
export const PAYMENT_OPTIONS = new InjectionToken<readonly PaymentOption[]>('PAYMENT_OPTIONS');

/** Registers a payment option. Adding a method = adding a provider, never editing the component. */
export const providePaymentOption = (option: PaymentOption): Provider => ({
  provide: PAYMENT_OPTIONS,
  useValue: option,
  multi: true,
});
