// Package good shows SRP applied: one type per reason to change, plus a thin coordinator.
package good

import "fmt"

// Cents represents money as an integer number of cents to avoid float errors.
type Cents int64

func (c Cents) String() string { return fmt.Sprintf("%d.%02d", c/100, c%100) }

type OrderLine struct {
	SKU       string
	UnitPrice Cents
	Quantity  int
}

type Order struct {
	ID            string
	CustomerEmail string
	Lines         []OrderLine
}

type OrderTotals struct {
	Subtotal Cents
	Tax      Cents
	Total    Cents
}
