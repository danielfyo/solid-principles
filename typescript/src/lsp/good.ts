// LSP - the solution: only promise what every implementation can deliver.

export type Cents = number;

export interface Receipt {
  readonly transactionId: string;
  readonly amount: Cents;
}

/** Contract: amount must be positive (else RangeError); receipt for exactly that amount. */
export interface PaymentMethod {
  readonly name: string;
  charge(amount: Cents): Receipt;
}

/** A richer promise, made only by types that can keep it. Refunds succeed exactly once. */
export interface RefundablePaymentMethod extends PaymentMethod {
  refund(receipt: Receipt): void;
}

/** Shared bookkeeping, reused through composition instead of inheritance. */
class PaymentLedger {
  private readonly refundable = new Set<string>();
  private sequence = 0;

  constructor(private readonly prefix: string) {}

  record(amount: Cents): Receipt {
    if (amount <= 0) throw new RangeError("Amount must be positive.");
    const receipt = { transactionId: `${this.prefix}-${++this.sequence}`, amount };
    this.refundable.add(receipt.transactionId);
    return receipt;
  }

  reverse(receipt: Receipt): void {
    if (!this.refundable.delete(receipt.transactionId)) {
      throw new Error(`Unknown transaction ${receipt.transactionId}.`);
    }
  }
}

export class CreditCardPayment implements RefundablePaymentMethod {
  readonly name = "card";
  private readonly ledger = new PaymentLedger(this.name);

  charge(amount: Cents): Receipt {
    return this.ledger.record(amount);
  }

  refund(receipt: Receipt): void {
    this.ledger.reverse(receipt);
  }
}

export class PayPalPayment implements RefundablePaymentMethod {
  readonly name = "paypal";
  private readonly ledger = new PaymentLedger(this.name);

  charge(amount: Cents): Receipt {
    return this.ledger.record(amount);
  }

  refund(receipt: Receipt): void {
    this.ledger.reverse(receipt);
  }
}

/** ✅ Only promises what it can deliver: it can be charged. */
export class GiftCardPayment implements PaymentMethod {
  readonly name = "giftcard";
  private readonly ledger = new PaymentLedger(this.name);

  charge(amount: Cents): Receipt {
    return this.ledger.record(amount);
  }
}

/** Works with every payment method, no instanceof checks needed. */
export class PaymentProcessor {
  pay(method: PaymentMethod, amount: Cents): Receipt {
    return method.charge(amount);
  }
}

/** ✅ Asks only for refundable methods: passing a gift card fails to compile. */
export class RefundService {
  refundOrder(method: RefundablePaymentMethod, receipt: Receipt): void {
    method.refund(receipt);
  }
}
