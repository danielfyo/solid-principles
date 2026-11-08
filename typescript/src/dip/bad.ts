// DIP - the problem: business policy creates and depends on concrete details.

export type Cents = number;

/** Stand-in for a third-party payment SDK (low-level detail). */
export class StripeApiClient {
  private sequence = 0;

  async createCharge(customerEmail: string, amountInCents: Cents): Promise<string> {
    // Imagine a real HTTP call here: network, API keys, rate limits...
    console.log(`[stripe] charging ${amountInCents} cents to ${customerEmail}`);
    return `ch_${++this.sequence}`;
  }
}

/** Stand-in for an SMTP library (low-level detail). */
export class SmtpEmailSender {
  async send(to: string, subject: string, body: string): Promise<void> {
    console.log(`[smtp] to=${to} subject=${subject} body=${body}`);
  }
}

export interface CheckoutResult {
  readonly succeeded: boolean;
  readonly message: string;
}

/**
 * ❌ Hard-wired to Stripe and SMTP: untestable in isolation, cannot simulate
 * a declined card, and switching provider means rewriting business code.
 */
export class CheckoutService {
  private readonly stripe = new StripeApiClient();
  private readonly email = new SmtpEmailSender();

  async checkout(customerEmail: string, amount: Cents): Promise<CheckoutResult> {
    const chargeId = await this.stripe.createCharge(customerEmail, amount);
    const body = `Payment of ${(amount / 100).toFixed(2)} EUR received (${chargeId}).`;
    await this.email.send(customerEmail, "Thanks for your order", body);
    return { succeeded: true, message: body };
  }
}
