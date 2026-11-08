import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PAYMENT_OPTIONS } from './payment-option';

/**
 * ✅ Closed for modification: it renders whatever options are registered in DI.
 * Open for extension: register a new PaymentOption, never edit this file.
 */
@Component({
  selector: 'app-payment-options',
  imports: [NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset>
      <legend>Payment method</legend>
      @for (option of options; track option.id) {
        <label>
          <input type="radio" name="payment-method" [checked]="option.id === selectedId()" (change)="selectedId.set(option.id)" />
          {{ option.label }}
        </label>
      }
      @if (selected(); as option) {
        <ng-container *ngComponentOutlet="option.component" />
      }
    </fieldset>
  `,
})
export class PaymentOptionsComponent {
  protected readonly options = inject(PAYMENT_OPTIONS);
  protected readonly selectedId = signal(this.options[0]?.id);
  protected readonly selected = computed(() => this.options.find((option) => option.id === this.selectedId()));
}
