import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MoneyPipe } from '../../shared/money.pipe';
import { Order } from '../types';
import { OrderTotals } from './order-totals';

/** Single reason to change: how the summary looks. Pure: inputs in, markup out. */
@Component({
  selector: 'app-order-summary-view',
  imports: [MoneyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-label="Order summary">
      <h2>Order {{ order().id }}</h2>
      <ul>
        @for (line of order().lines; track line.sku) {
          <li>{{ line.quantity }} × {{ line.name }} — {{ line.unitPrice * line.quantity | money }}</li>
        }
      </ul>
      <p>Subtotal: {{ totals().subtotal | money }}</p>
      <p>Tax: {{ totals().tax | money }}</p>
      <p><strong>Total: {{ totals().total | money }}</strong></p>
    </section>
  `,
})
export class OrderSummaryViewComponent {
  readonly order = input.required<Order>();
  readonly totals = input.required<OrderTotals>();
}
