// DIP - the solution: the policy owns its abstractions; details plug into them.

export type Cents = number;

// --- Abstractions owned by the high-level policy ---------------------------

export type PaymentResult =
  | { readonly succeeded: true; readonly transactionId: string }
  | { readonly succeeded: false; readonly error: string };

export interface PaymentGateway {
  charge(customerEmail: string, amount: Cents): Promise<PaymentResult>;
}

export interface CustomerNotifier {
  notify(customerEmail: string, message: string): Promise<void>;
}

export interface CheckoutResult {
  readonly succeeded: boolean;
  readonly message: string;
}

/** ✅ Depends only on abstractions; knows nothing about Stripe or SMTP. */
export class CheckoutService {
  constructor(
    private readonly payments: PaymentGateway,
    private readonly notifier: CustomerNotifier,
  ) {}

  async checkout(customerEmail: string, amount: Cents): Promise<CheckoutResult> {
    const payment = await this.payments.charge(customerEmail, amount);
    if (!payment.succeeded) {
      return { succeeded: false, message: `Payment declined: ${payment.error}` };
    }

    const message = `Payment of ${(amount / 100).toFixed(2)} EUR received (${payment.transactionId}).`;
    await this.notifier.notify(customerEmail, message);
    return { succeeded: true, message };
  }
}

// --- Low-level details (infrastructure) -------------------------------------

/** Stand-in for a third-party payment SDK we do not control. */
export class StripeApiClient {
  private sequence = 0;

  async createCharge(customerEmail: string, amountInCents: Cents): Promise<string> {
    console.log(`[stripe] charging ${amountInCents} cents to ${customerEmail}`);
    return `ch_${++this.sequence}`;
  }
}

export class SmtpEmailSender {
  async send(to: string, subject: string, body: string): Promise<void> {
    console.log(`[smtp] to=${to} subject=${subject} body=${body}`);
  }
}

/** ✅ Adapter: the detail implements the policy's abstraction. */
export class StripePaymentGateway implements PaymentGateway {
  constructor(private readonly client: StripeApiClient) {}

  async charge(customerEmail: string, amount: Cents): Promise<PaymentResult> {
    const transactionId = await this.client.createCharge(customerEmail, amount);
    return { succeeded: true, transactionId };
  }
}

export class EmailCustomerNotifier implements CustomerNotifier {
  constructor(private readonly smtp: SmtpEmailSender) {}

  notify(customerEmail: string, message: string): Promise<void> {
    return this.smtp.send(customerEmail, "Thanks for your order", message);
  }
}

// --- Composition root: the only place that knows the concrete classes --------

export const createCheckoutService = (): CheckoutService =>
  new CheckoutService(
    new StripePaymentGateway(new StripeApiClient()),
    new EmailCustomerNotifier(new SmtpEmailSender()),
  );
