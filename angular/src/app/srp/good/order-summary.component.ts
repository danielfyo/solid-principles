import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { OrderApi } from './order-api';
import { OrderSummaryViewComponent } from './order-summary-view.component';
import { calculateTotals } from './order-totals';

const TAX_RATE = 0.21;

/** ✅ A thin container: wires the data service, the pricing function and the view. */
@Component({
  selector: 'app-order-summary',
  imports: [OrderSummaryViewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (order.error(); as error) {
      <p role="alert">Could not load order: {{ errorMessage(error) }}</p>
    } @else if (totals(); as totals) {
      <app-order-summary-view [order]="order.value()!" [totals]="totals" />
    } @else {
      <p>Loading…</p>
    }
  `,
})
export class OrderSummaryComponent {
  readonly orderId = input.required<string>();

  private readonly api = inject(OrderApi);
  protected readonly order = rxResource({
    params: () => this.orderId(),
    stream: ({ params: orderId }) => this.api.load(orderId),
  });
  protected readonly totals = computed(() =>
    this.order.hasValue() ? calculateTotals(this.order.value(), TAX_RATE) : null,
  );

  protected errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
