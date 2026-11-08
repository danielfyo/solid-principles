// ISP - the problem: a fat interface that every client must depend on.

export type Cents = number;

export interface StoredOrder {
  readonly id: string;
  readonly customerName: string;
  readonly total: Cents;
  readonly placedOn: Date;
}

/** ❌ Mixes reading, writing and reporting in one abstraction. */
export interface OrderStore {
  getById(id: string): StoredOrder | undefined;
  save(order: StoredOrder): void;
  delete(id: string): void;
  totalSalesFor(year: number, month: number): Cents;
}

/** Read-only archive forced to "implement" writes it can never support. */
export class ArchivedOrderStore implements OrderStore {
  private readonly orders: ReadonlyMap<string, StoredOrder>;

  constructor(orders: Iterable<StoredOrder>) {
    this.orders = new Map([...orders].map((o) => [o.id, o]));
  }

  getById(id: string): StoredOrder | undefined {
    return this.orders.get(id);
  }

  save(_order: StoredOrder): void {
    throw new Error("The archive is read-only.");
  }

  delete(_id: string): void {
    throw new Error("The archive is read-only.");
  }

  totalSalesFor(year: number, month: number): Cents {
    return [...this.orders.values()]
      .filter((o) => o.placedOn.getUTCFullYear() === year && o.placedOn.getUTCMonth() + 1 === month)
      .reduce((sum, o) => sum + o.total, 0);
  }
}

/** Only needs getById, yet any test double must fake all four methods. */
export class InvoicePrinter {
  constructor(private readonly store: OrderStore) {}

  print(orderId: string): string {
    const order = this.store.getById(orderId);
    if (!order) throw new Error(`Order ${orderId} not found.`);
    return `Invoice ${order.id} | ${order.customerName} | ${(order.total / 100).toFixed(2)} EUR`;
  }
}
