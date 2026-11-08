// Package good shows ISP applied. In Go, small interfaces are idiomatic
// ("the bigger the interface, the weaker the abstraction") and are best
// declared next to the code that CONSUMES them.
package good

import (
	"errors"
	"fmt"
	"time"
)

var ErrOrderNotFound = errors.New("order not found")

type StoredOrder struct {
	ID           string
	CustomerName string
	TotalCents   int64
	PlacedOn     time.Time
}

// ✅ Role interfaces, each shaped by what one kind of client needs.

type OrderReader interface {
	GetByID(id string) (StoredOrder, bool)
}

type OrderWriter interface {
	Save(order StoredOrder)
	Delete(id string)
}

type SalesStatistics interface {
	TotalSalesFor(year int, month time.Month) int64
}

// Compile-time proof of which roles each store plays.
var (
	_ OrderReader     = (*InMemoryOrderStore)(nil)
	_ OrderWriter     = (*InMemoryOrderStore)(nil)
	_ SalesStatistics = (*InMemoryOrderStore)(nil)
	_ OrderReader     = (*ArchivedOrderStore)(nil)
	_ SalesStatistics = (*ArchivedOrderStore)(nil)
)

type orderMap map[string]StoredOrder

func (m orderMap) GetByID(id string) (StoredOrder, bool) {
	o, ok := m[id]
	return o, ok
}

func (m orderMap) TotalSalesFor(year int, month time.Month) int64 {
	var total int64
	for _, o := range m {
		if o.PlacedOn.Year() == year && o.PlacedOn.Month() == month {
			total += o.TotalCents
		}
	}
	return total
}

// InMemoryOrderStore is a full-featured store: it plays every role.
type InMemoryOrderStore struct{ orderMap }

func NewInMemoryOrderStore() *InMemoryOrderStore { return &InMemoryOrderStore{orderMap{}} }

func (s *InMemoryOrderStore) Save(order StoredOrder) { s.orderMap[order.ID] = order }
func (s *InMemoryOrderStore) Delete(id string)       { delete(s.orderMap, id) }

// ArchivedOrderStore ✅ implements only what it can honestly do: read and report.
type ArchivedOrderStore struct{ orderMap }

func NewArchivedOrderStore(orders ...StoredOrder) *ArchivedOrderStore {
	m := orderMap{}
	for _, o := range orders {
		m[o.ID] = o
	}
	return &ArchivedOrderStore{m}
}

// InvoicePrinter ✅ depends only on reading.
type InvoicePrinter struct{ Orders OrderReader }

func (p InvoicePrinter) Print(orderID string) (string, error) {
	o, ok := p.Orders.GetByID(orderID)
	if !ok {
		return "", fmt.Errorf("%w: %s", ErrOrderNotFound, orderID)
	}
	return fmt.Sprintf("Invoice %s | %s | %d.%02d EUR", o.ID, o.CustomerName, o.TotalCents/100, o.TotalCents%100), nil
}

// SalesDashboard ✅ depends only on statistics.
type SalesDashboard struct{ Statistics SalesStatistics }

func (d SalesDashboard) MonthlySummary(year int, month time.Month) string {
	total := d.Statistics.TotalSalesFor(year, month)
	return fmt.Sprintf("%04d-%02d: %d.%02d EUR", year, int(month), total/100, total%100)
}
