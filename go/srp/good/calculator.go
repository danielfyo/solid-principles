package good

// PriceCalculator has a single reason to change: how finance computes money.
type PriceCalculator struct {
	TaxRateBasisPoints int64 // 2100 = 21%
}

func (c PriceCalculator) Calculate(order Order) OrderTotals {
	var subtotal Cents
	for _, line := range order.Lines {
		subtotal += line.UnitPrice * Cents(line.Quantity)
	}
	tax := (subtotal*Cents(c.TaxRateBasisPoints) + 5000) / 10000 // round half up
	return OrderTotals{Subtotal: subtotal, Tax: tax, Total: subtotal + tax}
}
