// Package bad shows an ISP violation: a fat interface every client must depend on.
package bad

import (
	"errors"
	"fmt"
	"time"
)

var ErrReadOnly = errors.New("the archive is read-only")

type StoredOrder struct {
	ID           string
	CustomerName string
	TotalCents   int64
	PlacedOn     time.Time
}

// OrderStore ❌ mixes reading, writing and reporting in one abstraction.
type OrderStore interface {
	GetByID(id string) (StoredOrder, bool)
	Save(order StoredOrder) error
	Delete(id string) error
	TotalSalesFor(year int, month time.Month) int64
}

// ArchivedOrderStore is read-only, yet is forced to "implement" writes.
type ArchivedOrderStore struct{ orders map[string]StoredOrder }

func NewArchivedOrderStore(orders ...StoredOrder) *ArchivedOrderStore {
	store := &ArchivedOrderStore{orders: map[string]StoredOrder{}}
	for _, o := range orders {
		store.orders[o.ID] = o
	}
	return store
}

func (a *ArchivedOrderStore) GetByID(id string) (StoredOrder, bool) {
	o, ok := a.orders[id]
	return o, ok
}

func (a *ArchivedOrderStore) Save(StoredOrder) error { return ErrReadOnly }
func (a *ArchivedOrderStore) Delete(string) error    { return ErrReadOnly }

func (a *ArchivedOrderStore) TotalSalesFor(year int, month time.Month) int64 {
	var total int64
	for _, o := range a.orders {
		if o.PlacedOn.Year() == year && o.PlacedOn.Month() == month {
			total += o.TotalCents
		}
	}
	return total
}

// InvoicePrinter only needs GetByID, yet any fake must implement all four methods.
type InvoicePrinter struct{ Store OrderStore }

func (p InvoicePrinter) Print(orderID string) (string, error) {
	o, ok := p.Store.GetByID(orderID)
	if !ok {
		return "", fmt.Errorf("order %s not found", orderID)
	}
	return fmt.Sprintf("Invoice %s | %s | %d.%02d EUR", o.ID, o.CustomerName, o.TotalCents/100, o.TotalCents%100), nil
}
