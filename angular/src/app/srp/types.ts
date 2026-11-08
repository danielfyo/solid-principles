import { Cents } from '../shared/money';

export interface OrderLine {
  readonly sku: string;
  readonly name: string;
  readonly unitPrice: Cents;
  readonly quantity: number;
}

export interface Order {
  readonly id: string;
  readonly lines: readonly OrderLine[];
}
