// SRP - the problem: one class with four reasons to change.

/** Money as integer cents to avoid floating-point errors. */
export type Cents = number;

export interface OrderLine {
  readonly sku: string;
  readonly unitPrice: Cents;
  readonly quantity: number;
}

export interface Order {
  readonly id: string;
  readonly customerEmail: string;
  readonly lines: readonly OrderLine[];
}

/**
 * ❌ Validates, prices, persists AND notifies. Product owner, finance, DBA and
 * marketing can each force a change here, risking the other three jobs.
 */
export class OrderService {
  private static readonly TAX_RATE = 0.21;

  readonly ordersTable = new Map<string, Cents>();
  readonly sentEmails: string[] = [];

  placeOrder(order: Order): Cents {
    // 1) Business rules (product owner)
    if (order.lines.length === 0) throw new Error("An order needs at least one line.");
    if (order.lines.some((line) => line.quantity <= 0)) throw new Error("Quantities must be positive.");
    if (!order.customerEmail.includes("@")) throw new Error("Customer email is invalid.");

    // 2) Pricing and taxes (finance)
    const subtotal = order.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    const total = subtotal + Math.round(subtotal * OrderService.TAX_RATE);

    // 3) Persistence (DBA / infrastructure)
    this.ordersTable.set(order.id, total);

    // 4) Notification wording and delivery (marketing)
    this.sentEmails.push(
      `To: ${order.customerEmail} | Order ${order.id} confirmed | Total: ${(total / 100).toFixed(2)} EUR`,
    );
    return total;
  }
}
