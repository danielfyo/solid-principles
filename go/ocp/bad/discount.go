// Package bad shows an OCP violation: every new promotion edits the same function.
package bad

// Cents represents money as an integer number of cents.
type Cents int64

type CustomerTier int

const (
	Regular CustomerTier = iota
	Premium
	VIP
)

type Cart struct {
	Tier      CustomerTier
	Subtotal  Cents
	ItemCount int
}

// CalculateDiscount ❌ grows a new branch for every promotion marketing invents.
func CalculateDiscount(cart Cart) Cents {
	var discount Cents
	switch cart.Tier {
	case Regular:
		discount = 0
	case Premium:
		discount = cart.Subtotal * 10 / 100
	case VIP:
		discount = cart.Subtotal * 20 / 100
	}

	// Marketing asked for a bulk discount... so we patched it in here.
	// Next month: Black Friday, coupons, first purchase... more edits.
	if cart.ItemCount >= 10 {
		discount = max(discount, cart.Subtotal*5/100)
	}
	return discount
}
