import { Cents } from '../../shared/money';
import { Order } from '../types';

export interface OrderTotals {
  readonly subtotal: Cents;
  readonly tax: Cents;
  readonly total: Cents;
}

/** Single reason to change: pricing rules. A pure function, trivial to test. */
export function calculateTotals(order: Order, taxRate: number): OrderTotals {
  const subtotal = order.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const tax = Math.round(subtotal * taxRate);
  return { subtotal, tax, total: subtotal + tax };
}
