package good

import "fmt"

// OrderConfirmationNotifier has a single reason to change: what the customer is told.
type OrderConfirmationNotifier struct {
	SentMessages []string
}

func (n *OrderConfirmationNotifier) NotifyOrderPlaced(order Order, totals OrderTotals) {
	n.SentMessages = append(n.SentMessages, fmt.Sprintf(
		"To: %s | Order %s confirmed | Total: %s EUR", order.CustomerEmail, order.ID, totals.Total))
}
