// LSP - the problem: a subclass that cannot keep the base class promise.

export type Cents = number;

export interface Receipt {
  readonly transactionId: string;
  readonly amount: Cents;
}

/** Promises that every payment method can be charged AND refunded. */
export abstract class PaymentMethod {
  private readonly issued = new Set<string>();
  private sequence = 0;

  abstract readonly name: string;

  charge(amount: Cents): Receipt {
    if (amount <= 0) throw new RangeError("Amount must be positive.");
    const receipt = { transactionId: `${this.name}-${++this.sequence}`, amount };
    this.issued.add(receipt.transactionId);
    return receipt;
  }

  refund(receipt: Receipt): void {
    if (!this.issued.delete(receipt.transactionId)) {
      throw new Error(`Unknown transaction ${receipt.transactionId}.`);
    }
  }
}

export class CreditCardPayment extends PaymentMethod {
  readonly name = "card";
}

export class PayPalPayment extends PaymentMethod {
  readonly name = "paypal";
}

/** ❌ IS-A PaymentMethod by inheritance, but breaks the refund promise. */
export class GiftCardPayment extends PaymentMethod {
  readonly name = "giftcard";

  override refund(_receipt: Receipt): void {
    throw new Error("Gift card payments cannot be refunded.");
  }
}

/** Written against the base type, as it should be... and it still breaks. */
export class RefundService {
  refundOrder(method: PaymentMethod, receipt: Receipt): void {
    method.refund(receipt); // 💥 throws at runtime for gift cards
  }
}
