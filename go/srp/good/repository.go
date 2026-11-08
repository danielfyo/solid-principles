package good

// OrderRepository has a single reason to change: how orders are stored.
type OrderRepository struct {
	orders map[string]OrderTotals
}

func NewOrderRepository() *OrderRepository {
	return &OrderRepository{orders: map[string]OrderTotals{}}
}

func (r *OrderRepository) Save(order Order, totals OrderTotals) {
	r.orders[order.ID] = totals
}

func (r *OrderRepository) FindTotals(orderID string) (OrderTotals, bool) {
	totals, ok := r.orders[orderID]
	return totals, ok
}
