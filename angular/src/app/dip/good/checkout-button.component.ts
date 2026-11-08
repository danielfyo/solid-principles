import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Cents, formatMoney } from '../../shared/money';
import { PaymentGateway } from './payment-gateway';

/** ✅ Depends on the PaymentGateway abstraction, resolved by Angular's injector. */
@Component({
  selector: 'app-checkout-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" [disabled]="busy()" (click)="pay()">Pay {{ label() }}</button>
    <p role="status">{{ status() }}</p>
  `,
})
export class CheckoutButtonComponent {
  readonly email = input.required<string>();
  readonly amount = input.required<Cents>();

  private readonly payments = inject(PaymentGateway);
  protected readonly label = computed(() => formatMoney(this.amount()));
  protected readonly status = signal('');
  protected readonly busy = signal(false);

  protected async pay(): Promise<void> {
    this.busy.set(true);
    const result = await this.payments.charge(this.email(), this.amount());
    this.status.set(
      result.succeeded ? `Paid ${this.label()} (${result.transactionId})` : `Payment declined: ${result.error}`,
    );
    this.busy.set(false);
  }
}
