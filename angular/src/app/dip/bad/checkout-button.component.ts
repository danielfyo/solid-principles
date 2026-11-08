import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { Cents, formatMoney } from '../../shared/money';
import { stripeClient } from './stripe-client';

/**
 * ❌ DIP violation: a UI/business component imports a concrete vendor SDK.
 * - Tests must monkey-patch a global module object to avoid "real" charges.
 * - Demos, Storybook and other providers are impossible without editing it.
 */
@Component({
  selector: 'app-bad-checkout-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" (click)="pay()">Pay {{ label() }}</button>
    <p role="status">{{ status() }}</p>
  `,
})
export class BadCheckoutButtonComponent {
  readonly email = input.required<string>();
  readonly amount = input.required<Cents>();
  protected readonly status = signal('');

  protected label(): string {
    return formatMoney(this.amount());
  }

  protected async pay(): Promise<void> {
    const chargeId = await stripeClient.createCharge(this.email(), this.amount());
    this.status.set(`Paid ${formatMoney(this.amount())} (${chargeId})`);
  }
}
