import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadPaymentOptionsComponent } from './bad/payment-options.component';
import { providePaymentOption } from './good/payment-option';
import { PaymentOptionsComponent } from './good/payment-options.component';
import { defaultPaymentOptions } from './good/payment-registry';

const labelled = (fixture: ComponentFixture<unknown>, text: string): HTMLInputElement => {
  const label = [...(fixture.nativeElement as HTMLElement).querySelectorAll('label')].find((l) =>
    l.textContent?.includes(text),
  );
  return label!.querySelector('input')!;
};

async function selectPayPal(fixture: ComponentFixture<unknown>): Promise<void> {
  labelled(fixture, 'PayPal').click();
  await fixture.whenStable();
}

describe('OCP', () => {
  it.each<[string, Type<unknown>]>([
    ['bad', BadPaymentOptionsComponent],
    ['good', PaymentOptionsComponent],
  ])('%s version shows the card form and switches to PayPal', async (_name, component) => {
    TestBed.configureTestingModule({ providers: defaultPaymentOptions });
    const fixture = TestBed.createComponent(component);
    await fixture.whenStable();
    expect(labelled(fixture, 'Card number')).toBeTruthy();

    await selectPayPal(fixture);

    expect(fixture.nativeElement.textContent).toContain('You will be redirected to PayPal.');
  });

  it('a new payment method is added without touching PaymentOptionsComponent', async () => {
    @Component({ selector: 'app-bizum-form', template: `<p>Enter your phone number.</p>` })
    class BizumFormComponent {}

    TestBed.configureTestingModule({
      providers: [...defaultPaymentOptions, providePaymentOption({ id: 'bizum', label: 'Bizum', component: BizumFormComponent })],
    });
    const fixture = TestBed.createComponent(PaymentOptionsComponent);
    await fixture.whenStable();

    labelled(fixture, 'Bizum').click();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Enter your phone number.');
  });
});
