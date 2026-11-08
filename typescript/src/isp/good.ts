// ISP - the solution: small role interfaces shaped by each client's needs.

export type Cents = number;

export interface StoredOrder {
  readonly id: string;
  readonly customerName: string;
  readonly total: Cents;
  readonly placedOn: Date;
}

// ✅ Role interfaces.
export interface OrderReader {
  getById(id: string): StoredOrder | undefined;
}

export interface OrderWriter {
  save(order: StoredOrder): void;
  delete(id: string): void;
}

export interface SalesStatistics {
  totalSalesFor(year: number, month: number): Cents;
}

const totalSales = (orders: Iterable<StoredOrder>, year: number, month: number): Cents =>
  [...orders]
    .filter((o) => o.placedOn.getUTCFullYear() === year && o.placedOn.getUTCMonth() + 1 === month)
    .reduce((sum, o) => sum + o.total, 0);

/** A full-featured store simply implements every role. */
export class InMemoryOrderStore implements OrderReader, OrderWriter, SalesStatistics {
  private readonly orders = new Map<string, StoredOrder>();

  getById(id: string): StoredOrder | undefined {
    return this.orders.get(id);
  }

  save(order: StoredOrder): void {
    this.orders.set(order.id, order);
  }

  delete(id: string): void {
    this.orders.delete(id);
  }

  totalSalesFor(year: number, month: number): Cents {
    return totalSales(this.orders.values(), year, month);
  }
}

/** ✅ Implements only what it can honestly do: read and report. */
export class ArchivedOrderStore implements OrderReader, SalesStatistics {
  private readonly orders: ReadonlyMap<string, StoredOrder>;

  constructor(orders: Iterable<StoredOrder>) {
    this.orders = new Map([...orders].map((o) => [o.id, o]));
  }

  getById(id: string): StoredOrder | undefined {
    return this.orders.get(id);
  }

  totalSalesFor(year: number, month: number): Cents {
    return totalSales(this.orders.values(), year, month);
  }
}

/** ✅ Depends only on reading. */
export class InvoicePrinter {
  constructor(private readonly orders: OrderReader) {}

  print(orderId: string): string {
    const order = this.orders.getById(orderId);
    if (!order) throw new Error(`Order ${orderId} not found.`);
    return `Invoice ${order.id} | ${order.customerName} | ${(order.total / 100).toFixed(2)} EUR`;
  }
}

/** ✅ Depends only on statistics. */
export class SalesDashboard {
  constructor(private readonly statistics: SalesStatistics) {}

  monthlySummary(year: number, month: number): string {
    const total = this.statistics.totalSalesFor(year, month);
    return `${year}-${String(month).padStart(2, "0")}: ${(total / 100).toFixed(2)} EUR`;
  }
}
