// Package bad shows an SRP violation: one type with four reasons to change.
package bad

import (
	"errors"
	"fmt"
	"strings"
)

// Cents represents money as an integer number of cents to avoid float errors.
type Cents int64

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

// taxRateBasisPoints is 21% expressed in basis points (1/100 of a percent).
const taxRateBasisPoints = 2100

// OrderService ❌ validates, prices, persists AND notifies. Product owner,
// finance, DBA and marketing can each force a change here.
type OrderService struct {
	OrdersTable map[string]Cents
	SentEmails  []string
}

func NewOrderService() *OrderService {
	return &OrderService{OrdersTable: map[string]Cents{}}
}

func (s *OrderService) PlaceOrder(order Order) (Cents, error) {
	// 1) Business rules (product owner)
	if len(order.Lines) == 0 {
		return 0, errors.New("an order needs at least one line")
	}
	for _, line := range order.Lines {
		if line.Quantity <= 0 {
			return 0, errors.New("quantities must be positive")
		}
	}
	if !strings.Contains(order.CustomerEmail, "@") {
		return 0, errors.New("customer email is invalid")
	}

	// 2) Pricing and taxes (finance)
	var subtotal Cents
	for _, line := range order.Lines {
		subtotal += line.UnitPrice * Cents(line.Quantity)
	}
	total := subtotal + (subtotal*taxRateBasisPoints+5000)/10000

	// 3) Persistence (DBA / infrastructure)
	s.OrdersTable[order.ID] = total

	// 4) Notification wording and delivery (marketing)
	s.SentEmails = append(s.SentEmails, fmt.Sprintf(
		"To: %s | Order %s confirmed | Total: %d.%02d EUR",
		order.CustomerEmail, order.ID, total/100, total%100))

	return total, nil
}
