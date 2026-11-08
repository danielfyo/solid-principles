import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The base contract: a native <button>. Attribute selectors keep the real element, so
 * every variant inherits `disabled`, focus, keyboard activation, forms and ARIA for free.
 */
@Component({
  selector: 'button[appButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.type]': 'type()' },
  template: `<ng-content />`,
})
export class ButtonComponent {
  readonly type = input<'button' | 'submit' | 'reset'>('button');
}

/** ✅ Specialises the look, keeps the whole contract. */
@Component({
  selector: 'button[appPrimaryButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'btn-primary', '[attr.type]': 'type()' },
  template: `<ng-content />`,
})
export class PrimaryButtonComponent {
  readonly type = input<'button' | 'submit' | 'reset'>('button');
}

/** ✅ Adds an icon, still a real <button>: substitutable anywhere a button is. */
@Component({
  selector: 'button[appIconButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.type]': 'type()' },
  template: `<span aria-hidden="true">{{ icon() }}</span> <ng-content />`,
})
export class IconButtonComponent {
  readonly icon = input.required<string>({ alias: 'appIconButton' });
  readonly type = input<'button' | 'submit' | 'reset'>('button');
}
