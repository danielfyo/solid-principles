import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { BadOrderSummaryComponent } from './bad/order-summary.component';
import { OrderApi } from './good/order-api';
import { OrderSummaryViewComponent } from './good/order-summary-view.component';
import { OrderSummaryComponent } from './good/order-summary.component';
import { calculateTotals } from './good/order-totals';
import { Order } from './types';

const order: Order = { id: 'A-1', lines: [{ sku: 'BOOK', name: 'Clean Code', unitPrice: 1000, quantity: 2 }] };

const text = (el: HTMLElement) => el.textContent?.replace(/\s+/g, ' ').trim() ?? '';

describe('SRP - the problem', () => {
  it('can only be tested by faking the HTTP layer behind the component', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const fixture = TestBed.createComponent(BadOrderSummaryComponent);
    fixture.componentRef.setInput('orderId', 'A-1');
    fixture.detectChanges();

    TestBed.inject(HttpTestingController).expectOne('/api/orders/A-1').flush(order);
    await fixture.whenStable();

    expect(text(fixture.nativeElement)).toContain('Total: €24.20');
  });
});

describe('SRP - the solution', () => {
  it('pricing is a pure function', () => {
    expect(calculateTotals(order, 0.21)).toEqual({ subtotal: 2000, tax: 420, total: 2420 });
  });

  it('the view renders from inputs alone', async () => {
    const fixture = TestBed.createComponent(OrderSummaryViewComponent);
    fixture.componentRef.setInput('order', order);
    fixture.componentRef.setInput('totals', { subtotal: 2000, tax: 420, total: 2420 });
    await fixture.whenStable();

    expect(text(fixture.nativeElement)).toContain('2 × Clean Code — €20.00');
    expect(text(fixture.nativeElement)).toContain('Total: €24.20');
  });

  it('the container composes the pieces with an injected data service', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: OrderApi, useValue: { load: () => of(order) } }] });
    const fixture = TestBed.createComponent(OrderSummaryComponent);
    fixture.componentRef.setInput('orderId', 'A-1');
    await fixture.whenStable();

    expect(text(fixture.nativeElement)).toContain('Total: €24.20');
  });

  it('shows loading errors', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: OrderApi, useValue: { load: () => throwError(() => new Error('offline')) } }],
    });
    const fixture = TestBed.createComponent(OrderSummaryComponent);
    fixture.componentRef.setInput('orderId', 'A-1');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('offline');
  });
});
