import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CheckoutButtonComponent } from './dip/good/checkout-button.component';
import { CustomerBadgeComponent } from './isp/good/customer-badge.component';
import { IconButtonComponent, PrimaryButtonComponent } from './lsp/good/buttons';
import { PaymentOptionsComponent } from './ocp/good/payment-options.component';
import { OrderSummaryComponent } from './srp/good/order-summary.component';

/** A gallery of the ✅ components, all wired in app.config.ts (the composition root). */
@Component({
  selector: 'app-root',
  imports: [
    OrderSummaryComponent,
    PaymentOptionsComponent,
    PrimaryButtonComponent,
    IconButtonComponent,
    CustomerBadgeComponent,
    CheckoutButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    main { font-family: system-ui; max-width: 640px; margin: 2rem auto; line-height: 1.5; }
  `,
  template: `
    <main>
      <h1>SOLID in Angular</h1>

      <h2>S — Single Responsibility</h2>
      <app-order-summary orderId="A-1" />

      <h2>O — Open/Closed</h2>
      <app-payment-options />

      <h2>L — Liskov Substitution</h2>
      <button appPrimaryButton (click)="added()">Add to cart</button>
      <button appIconButton="🛒" disabled>Out of stock</button>

      <h2>I — Interface Segregation</h2>
      <app-customer-badge name="Ana" [isVip]="true" />

      <h2>D — Dependency Inversion</h2>
      <app-checkout-button email="ana@example.com" [amount]="5600" />
    </main>
  `,
})
export class App {
  protected added(): void {
    alert('Added!');
  }
}
