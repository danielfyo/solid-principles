import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../types';

/** Single reason to change: the HTTP contract with the backend. */
@Injectable({ providedIn: 'root' })
export class OrderApi {
  private readonly http = inject(HttpClient);

  load(orderId: string): Observable<Order> {
    return this.http.get<Order>(`/api/orders/${encodeURIComponent(orderId)}`);
  }
}
