import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Order } from '../types';
import { CustomerBadgeComponent } from './customer-badge.component';

/** The parent that owns the rich object maps it to the narrow inputs. */
@Component({
  selector: 'app-order-header',
  imports: [CustomerBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header>
      <h2>Order {{ order().id }}</h2>
      <app-customer-badge [name]="order().customer.name" [isVip]="order().customer.tier === 'vip'" />
    </header>
  `,
})
export class OrderHeaderComponent {
  readonly order = input.required<Pick<Order, 'id' | 'customer'>>();
}
