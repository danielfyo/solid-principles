import { Pipe, PipeTransform } from '@angular/core';
import { Cents, formatMoney } from './money';

/** Single reason to change: how money is displayed. Usage: {{ total | money }} */
@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  transform(amount: Cents): string {
    return formatMoney(amount);
  }
}
