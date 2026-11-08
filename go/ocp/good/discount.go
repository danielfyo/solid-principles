// Package good shows OCP applied: a stable calculator plus pluggable policies.
package good

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

// DiscountPolicy is the extension point: new promotions are new types, not edits.
type DiscountPolicy interface {
	DiscountFor(cart Cart) Cents
}

// DiscountPolicyFunc lets a plain function act as a policy (like http.HandlerFunc).
type DiscountPolicyFunc func(cart Cart) Cents

func (f DiscountPolicyFunc) DiscountFor(cart Cart) Cents { return f(cart) }

type TierDiscount struct {
	Tier    CustomerTier
	Percent int64
}

func (d TierDiscount) DiscountFor(cart Cart) Cents {
	if cart.Tier != d.Tier {
		return 0
	}
	return cart.Subtotal * Cents(d.Percent) / 100
}

type BulkDiscount struct {
	MinimumItems int
	Percent      int64
}

func (d BulkDiscount) DiscountFor(cart Cart) Cents {
	if cart.ItemCount < d.MinimumItems {
		return 0
	}
	return cart.Subtotal * Cents(d.Percent) / 100
}

func DefaultDiscounts() []DiscountPolicy {
	return []DiscountPolicy{
		TierDiscount{Tier: Premium, Percent: 10},
		TierDiscount{Tier: VIP, Percent: 20},
		BulkDiscount{MinimumItems: 10, Percent: 5},
	}
}

// DiscountCalculator ✅ applies the best policy without knowing which ones exist.
type DiscountCalculator struct {
	policies []DiscountPolicy
}

func NewDiscountCalculator(policies ...DiscountPolicy) DiscountCalculator {
	return DiscountCalculator{policies: policies}
}

func (c DiscountCalculator) CalculateDiscount(cart Cart) Cents {
	var best Cents
	for _, policy := range c.policies {
		best = max(best, policy.DiscountFor(cart))
	}
	return min(best, cart.Subtotal)
}
