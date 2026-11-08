package good_test

import (
	"errors"
	"testing"
	"time"

	"github.com/danielfyo/solid-principles-dotnet/go/isp/bad"
	"github.com/danielfyo/solid-principles-dotnet/go/isp/good"
)

func day(y int, m time.Month, d int) time.Time { return time.Date(y, m, d, 0, 0, 0, 0, time.UTC) }

var (
	march    = good.StoredOrder{ID: "O-1", CustomerName: "Ana", TotalCents: 12000, PlacedOn: day(2026, time.March, 14)}
	marchToo = good.StoredOrder{ID: "O-2", CustomerName: "Luis", TotalCents: 3050, PlacedOn: day(2026, time.March, 20)}
	april    = good.StoredOrder{ID: "O-3", CustomerName: "Eva", TotalCents: 9999, PlacedOn: day(2026, time.April, 2)}
)

func TestBadFatInterfaceForcesTheArchiveToLie(t *testing.T) {
	if err := bad.NewArchivedOrderStore().Delete("O-1"); !errors.Is(err, bad.ErrReadOnly) {
		t.Fatalf("expected ErrReadOnly, got %v", err)
	}
}

// stubReader: with a narrow interface, a test double is one method.
type stubReader struct{ order good.StoredOrder }

func (s stubReader) GetByID(id string) (good.StoredOrder, bool) { return s.order, id == s.order.ID }

func TestInvoicePrinterOnlyNeedsAReader(t *testing.T) {
	printer := good.InvoicePrinter{Orders: stubReader{march}}

	if got, _ := printer.Print("O-1"); got != "Invoice O-1 | Ana | 120.00 EUR" {
		t.Fatalf("got %q", got)
	}
	if _, err := printer.Print("missing"); !errors.Is(err, good.ErrOrderNotFound) {
		t.Fatalf("expected ErrOrderNotFound, got %v", err)
	}
}

func TestReadOnlyArchiveWorksWithReadingAndReportingClients(t *testing.T) {
	archive := good.NewArchivedOrderStore(march, marchToo, april)

	if got, _ := (good.InvoicePrinter{Orders: archive}).Print("O-3"); got != "Invoice O-3 | Eva | 99.99 EUR" {
		t.Fatalf("got %q", got)
	}
	if got := (good.SalesDashboard{Statistics: archive}).MonthlySummary(2026, time.March); got != "2026-03: 150.50 EUR" {
		t.Fatalf("got %q", got)
	}
}

func TestLiveStorePlaysEveryRole(t *testing.T) {
	store := good.NewInMemoryOrderStore()
	store.Save(march)
	store.Save(april)
	store.Delete("O-3")

	if _, ok := store.GetByID("O-1"); !ok {
		t.Fatal("O-1 should exist")
	}
	if _, ok := store.GetByID("O-3"); ok {
		t.Fatal("O-3 should be deleted")
	}
	if got := store.TotalSalesFor(2026, time.April); got != 0 {
		t.Fatalf("got %d", got)
	}
}
