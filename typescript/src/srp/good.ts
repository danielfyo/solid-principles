// SRP - the solution: one class per reason to change, plus a thin coordinator.

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

export interface OrderTotals {
  readonly subtotal: Cents;
  readonly tax: Cents;
  readonly total: Cents;
}

export class InvalidOrderError extends Error {
  override readonly name = "InvalidOrderError";
}

/** Single reason to change: the business rules that define a valid order. */
export class OrderValidator {
  ensureValid(order: Order): void {
    if (order.lines.length === 0) throw new InvalidOrderError("An order needs at least one line.");
    if (order.lines.some((line) => line.quantity <= 0)) {
      throw new InvalidOrderError("Quantities must be positive.");
    }
    if (!order.customerEmail.includes("@")) throw new InvalidOrderError("Customer email is invalid.");
  }
}

/** Single reason to change: how finance computes money. */
export class PriceCalculator {
  constructor(private readonly taxRate: number) {}

  calculate(order: Order): OrderTotals {
    const subtotal = order.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    const tax = Math.round(subtotal * this.taxRate);
    return { subtotal, tax, total: subtotal + tax };
  }
}

/** Single reason to change: how orders are stored. */
export class OrderRepository {
  private readonly orders = new Map<string, OrderTotals>();

  save(order: Order, totals: OrderTotals): void {
    this.orders.set(order.id, totals);
  }

  findTotals(orderId: string): OrderTotals | undefined {
    return this.orders.get(orderId);
  }
}

/** Single reason to change: what the customer is told and how. */
export class OrderConfirmationNotifier {
  readonly sentMessages: string[] = [];

  notifyOrderPlaced(order: Order, totals: OrderTotals): void {
    this.sentMessages.push(
      `To: ${order.customerEmail} | Order ${order.id} confirmed | Total: ${(totals.total / 100).toFixed(2)} EUR`,
    );
  }
}

/** ✅ Only coordinates the workflow; every decision lives in a collaborator. */
export class OrderService {
  constructor(
    private readonly validator: OrderValidator,
    private readonly calculator: PriceCalculator,
    private readonly repository: OrderRepository,
    private readonly notifier: OrderConfirmationNotifier,
  ) {}

  placeOrder(order: Order): OrderTotals {
    this.validator.ensureValid(order);
    const totals = this.calculator.calculate(order);
    this.repository.save(order, totals);
    this.notifier.notifyOrderPlaced(order, totals);
    return totals;
  }
}
