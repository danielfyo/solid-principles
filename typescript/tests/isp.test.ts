import { describe, expect, it } from "vitest";
import * as bad from "../src/isp/bad.js";
import {
  ArchivedOrderStore,
  InMemoryOrderStore,
  InvoicePrinter,
  SalesDashboard,
  type OrderReader,
  type StoredOrder,
} from "../src/isp/good.js";

const march: StoredOrder = { id: "O-1", customerName: "Ana", total: 12_000, placedOn: new Date("2026-03-14") };
const marchToo: StoredOrder = { id: "O-2", customerName: "Luis", total: 3_050, placedOn: new Date("2026-03-20") };
const april: StoredOrder = { id: "O-3", customerName: "Eva", total: 9_999, placedOn: new Date("2026-04-02") };

describe("ISP", () => {
  it("bad fat interface forces the archive to lie", () => {
    expect(() => new bad.ArchivedOrderStore([]).delete("O-1")).toThrow("read-only");
  });

  it("InvoicePrinter only needs a reader (a one-line stub)", () => {
    const stub: OrderReader = { getById: (id) => (id === march.id ? march : undefined) };
    const printer = new InvoicePrinter(stub);

    expect(printer.print("O-1")).toBe("Invoice O-1 | Ana | 120.00 EUR");
    expect(() => printer.print("missing")).toThrow("not found");
  });

  it("read-only archive works with reading and reporting clients", () => {
    const archive = new ArchivedOrderStore([march, marchToo, april]);

    expect(new InvoicePrinter(archive).print("O-3")).toBe("Invoice O-3 | Eva | 99.99 EUR");
    expect(new SalesDashboard(archive).monthlySummary(2026, 3)).toBe("2026-03: 150.50 EUR");
  });

  it("live store plays every role", () => {
    const store = new InMemoryOrderStore();
    store.save(march);
    store.save(april);
    store.delete("O-3");

    expect(store.getById("O-1")).toBeDefined();
    expect(store.getById("O-3")).toBeUndefined();
    expect(store.totalSalesFor(2026, 4)).toBe(0);
  });
});
