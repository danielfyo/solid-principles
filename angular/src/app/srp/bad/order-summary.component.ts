import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { Order } from '../types';

/**
 * ❌ SRP violation: this component fetches data, manages loading/error state,
 * computes taxes, formats currency AND renders markup. A change to the API,
 * the tax rules, the locale or the design all land in the same file.
 */
@Component({
  selector: 'app-bad-order-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (error()) {
      <p role="alert">Could not load order: {{ error() }}</p>
    } @else if (order(); as order) {
      <section aria-label="Order summary">
        <h2>Order {{ order.id }}</h2>
        <ul>
          @for (line of order.lines; track line.sku) {
            <li>{{ line.quantity }} × {{ line.name }} — {{ format(line.unitPrice * line.quantity) }}</li>
          }
        </ul>
        <p>Subtotal: {{ format(subtotal(order)) }}</p>
        <p>Tax: {{ format(tax(order)) }}</p>
        <p><strong>Total: {{ format(subtotal(order) + tax(order)) }}</strong></p>
      </section>
    } @else {
      <p>Loading…</p>
    }
  `,
})
export class BadOrderSummaryComponent implements OnInit {
  readonly orderId = input.required<string>();

  private readonly http = inject(HttpClient);
  protected readonly order = signal<Order | null>(null);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.http.get<Order>(`/api/orders/${this.orderId()}`).subscribe({
      next: (order) => this.order.set(order),
      error: (e: unknown) => this.error.set(e instanceof Error ? e.message : String(e)),
    });
  }

  protected subtotal(order: Order): number {
    return order.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  }

  protected tax(order: Order): number {
    return Math.round(this.subtotal(order) * 0.21);
  }

  protected format(cents: number): string {
    return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
  }
}
