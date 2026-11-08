import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Order } from '../types';

/**
 * ❌ ISP violation: it needs a name and a tier, but demands a whole Order.
 * - It must be re-checked whenever ANY part of Order changes shape.
 * - It cannot be reused where there is no order (profile page, admin list...).
 * - Tests and stories must build a full Order fixture.
 */
@Component({
  selector: 'app-bad-customer-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class.badge-vip]="isVip()">{{ order().customer.name }}@if (isVip()) { ★ VIP}</span>`,
})
export class BadCustomerBadgeComponent {
  readonly order = input.required<Order>();
  protected readonly isVip = computed(() => this.order().customer.tier === 'vip');
}
