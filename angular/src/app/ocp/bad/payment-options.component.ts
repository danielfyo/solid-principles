import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

type PaymentMethodId = 'card' | 'paypal';

/**
 * ❌ OCP violation: supporting a new payment method (Bizum, Apple Pay...) means
 * editing this component: the type union, the radio list AND the @switch.
 */
@Component({
  selector: 'app-bad-payment-options',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset>
      <legend>Payment method</legend>
      <label><input type="radio" [checked]="selected() === 'card'" (change)="selected.set('card')" /> Card</label>
      <label><input type="radio" [checked]="selected() === 'paypal'" (change)="selected.set('paypal')" /> PayPal</label>
      @switch (selected()) {
        @case ('card') {
          <label>Card number <input name="cardNumber" inputmode="numeric" /></label>
        }
        @case ('paypal') {
          <p>You will be redirected to PayPal.</p>
        }
      }
    </fieldset>
  `,
})
export class BadPaymentOptionsComponent {
  protected readonly selected = signal<PaymentMethodId>('card');
}
