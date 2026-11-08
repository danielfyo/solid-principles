import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** ✅ Inputs are the component's interface: ask only for what you use. */
@Component({
  selector: 'app-customer-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class.badge-vip]="isVip()">{{ name() }}@if (isVip()) { ★ VIP}</span>`,
})
export class CustomerBadgeComponent {
  readonly name = input.required<string>();
  readonly isVip = input(false);
}
