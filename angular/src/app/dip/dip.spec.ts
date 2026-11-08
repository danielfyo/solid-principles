import { TestBed } from '@angular/core/testing';
import { BadCheckoutButtonComponent } from './bad/checkout-button.component';
import { stripeClient } from './bad/stripe-client';
import { CheckoutButtonComponent } from './good/checkout-button.component';
import { PaymentGateway, PaymentResult } from './good/payment-gateway';
import { STRIPE_CLIENT, StripePaymentGateway } from './good/stripe-payment-gateway';

async function clickPay(fixture: { nativeElement: HTMLElement; whenStable(): Promise<unknown> }) {
  fixture.nativeElement.querySelector('button')!.click();
  await fixture.whenStable();
  return fixture.nativeElement.querySelector('[role="status"]')!.textContent;
}

describe('DIP - the problem', () => {
  afterEach(() => vi.restoreAllMocks());

  it('needs to monkey-patch a global module object to avoid the real SDK', async () => {
    vi.spyOn(stripeClient, 'createCharge').mockResolvedValue('ch_mocked');
    const fixture = TestBed.createComponent(BadCheckoutButtonComponent);
    fixture.componentRef.setInput('email', 'ana@example.com');
    fixture.componentRef.setInput('amount', 2420);
    await fixture.whenStable();

    expect(await clickPay(fixture)).toContain('Paid €24.20 (ch_mocked)');
  });
});

describe('DIP - the solution', () => {
  async function renderWith(payments: PaymentGateway) {
    TestBed.configureTestingModule({ providers: [{ provide: PaymentGateway, useValue: payments }] });
    const fixture = TestBed.createComponent(CheckoutButtonComponent);
    fixture.componentRef.setInput('email', 'ana@example.com');
    fixture.componentRef.setInput('amount', 2420);
    await fixture.whenStable();
    return fixture;
  }

  it('charges through the injected gateway', async () => {
    const charge = vi.fn<PaymentGateway['charge']>().mockResolvedValue({ succeeded: true, transactionId: 'tx_1' });
    const fixture = await renderWith({ charge });

    expect(fixture.nativeElement.querySelector('button').textContent).toContain('Pay €24.20');
    expect(await clickPay(fixture)).toContain('Paid €24.20 (tx_1)');
    expect(charge).toHaveBeenCalledWith('ana@example.com', 2420);
  });

  it('a declined payment is trivial to simulate', async () => {
    const declined: PaymentResult = { succeeded: false, error: 'insufficient funds' };
    const fixture = await renderWith({ charge: async () => declined });

    expect(await clickPay(fixture)).toContain('Payment declined: insufficient funds');
  });

  it('the Stripe adapter maps SDK failures to the app result type', async () => {
    TestBed.configureTestingModule({
      providers: [
        StripePaymentGateway,
        { provide: STRIPE_CLIENT, useValue: { createCharge: () => Promise.reject(new Error('card expired')) } },
      ],
    });

    const result = await TestBed.inject(StripePaymentGateway).charge('ana@example.com', 100);

    expect(result).toEqual({ succeeded: false, error: 'Error: card expired' });
  });
});
