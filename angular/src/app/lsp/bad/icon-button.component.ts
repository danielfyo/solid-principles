import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * ❌ LSP violation: it accepts the same inputs as a button (`disabled`), so callers
 * expect a drop-in replacement, but it renders a <div>: `disabled` is ignored,
 * it is not focusable and keyboard users cannot activate it.
 */
@Component({
  selector: 'app-bad-icon-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="icon-button">{{ icon() }} <ng-content /></div>`,
})
export class BadIconButtonComponent {
  readonly icon = input.required<string>();
  readonly disabled = input(false);
}
