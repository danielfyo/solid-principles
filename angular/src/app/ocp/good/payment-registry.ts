import { ChangeDetectionStrategy, Component, Provider } from '@angular/core';
import { providePaymentOption } from './payment-option';

@Component({
  selector: 'app-card-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<label>Card number <input name="cardNumber" inputmode="numeric" /></label>`,
})
export class CardFormComponent {}

@Component({
  selector: 'app-paypal-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>You will be redirected to PayPal.</p>`,
})
export class PayPalFormComponent {}

/** The registry. Each feature can contribute its own option from its own providers. */
export const defaultPaymentOptions: Provider[] = [
  providePaymentOption({ id: 'card', label: 'Card', component: CardFormComponent }),
  providePaymentOption({ id: 'paypal', label: 'PayPal', component: PayPalFormComponent }),
];
