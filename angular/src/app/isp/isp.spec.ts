import { TestBed } from '@angular/core/testing';
import { BadCustomerBadgeComponent } from './bad/customer-badge.component';
import { CustomerBadgeComponent } from './good/customer-badge.component';
import { OrderHeaderComponent } from './good/order-header.component';
import { Order } from './types';

const text = (el: HTMLElement) => el.textContent?.replace(/\s+/g, ' ').trim() ?? '';

describe('ISP', () => {
  it('the bad badge needs a full Order fixture just to show a name', async () => {
    const order: Order = {
      id: 'O-1',
      placedAt: '2026-03-14T10:00:00Z',
      customer: { id: 'C-1', name: 'Ana', email: 'ana@example.com', tier: 'vip', addresses: [] },
      lines: [],
      payment: { method: 'card', status: 'paid' },
      total: 0,
    };
    const fixture = TestBed.createComponent(BadCustomerBadgeComponent);
    fixture.componentRef.setInput('order', order);
    await fixture.whenStable();

    expect(text(fixture.nativeElement)).toBe('Ana ★ VIP');
  });

  it('the good badge needs only what it shows', async () => {
    const fixture = TestBed.createComponent(CustomerBadgeComponent);
    fixture.componentRef.setInput('name', 'Ana');
    fixture.componentRef.setInput('isVip', true);
    await fixture.whenStable();

    expect(text(fixture.nativeElement)).toBe('Ana ★ VIP');
  });

  it('the good badge is reusable outside orders', async () => {
    const fixture = TestBed.createComponent(CustomerBadgeComponent);
    fixture.componentRef.setInput('name', 'Luis');
    await fixture.whenStable();

    const badge: HTMLElement = fixture.nativeElement.querySelector('.badge');
    expect(text(badge)).toBe('Luis');
    expect(badge.classList).not.toContain('badge-vip');
  });

  it('the parent maps the rich object to narrow inputs', async () => {
    const fixture = TestBed.createComponent(OrderHeaderComponent);
    fixture.componentRef.setInput('order', {
      id: 'O-1',
      customer: { id: 'C-1', name: 'Ana', email: '', tier: 'vip', addresses: [] },
    });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('h2').textContent).toContain('Order O-1');
    expect(text(fixture.nativeElement.querySelector('.badge'))).toBe('Ana ★ VIP');
  });
});
