package good

import (
	"errors"
	"strings"
)

// ErrInvalidOrder is wrapped by every validation failure.
var ErrInvalidOrder = errors.New("invalid order")

// OrderValidator has a single reason to change: the business rules of a valid order.
type OrderValidator struct{}

func (OrderValidator) Validate(order Order) error {
	if len(order.Lines) == 0 {
		return invalid("an order needs at least one line")
	}
	for _, line := range order.Lines {
		if line.Quantity <= 0 {
			return invalid("quantities must be positive")
		}
	}
	if !strings.Contains(order.CustomerEmail, "@") {
		return invalid("customer email is invalid")
	}
	return nil
}

func invalid(reason string) error { return errors.Join(ErrInvalidOrder, errors.New(reason)) }
