package good_test

import (
	"testing"

	"github.com/danielfyo/solid-principles-dotnet/go/ocp/bad"
	"github.com/danielfyo/solid-principles-dotnet/go/ocp/good"
)

var cases = []struct {
	name     string
	tier     good.CustomerTier
	subtotal good.Cents
	items    int
	want     good.Cents
}{
	{"regular", good.Regular, 10000, 1, 0},
	{"premium", good.Premium, 10000, 1, 1000},
	{"vip bulk", good.VIP, 10000, 12, 2000},
	{"regular bulk", good.Regular, 10000, 12, 500},
}

func TestGoodCalculatorAppliesTheBestPolicy(t *testing.T) {
	calculator := good.NewDiscountCalculator(good.DefaultDiscounts()...)
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := calculator.CalculateDiscount(good.Cart{Tier: tc.tier, Subtotal: tc.subtotal, ItemCount: tc.items})
			if got != tc.want {
				t.Fatalf("got %d, want %d", got, tc.want)
			}
		})
	}
}

func TestBadCalculatorGivesTheSameResultsToday(t *testing.T) {
	for _, tc := range cases {
		cart := bad.Cart{Tier: bad.CustomerTier(tc.tier), Subtotal: bad.Cents(tc.subtotal), ItemCount: tc.items}
		if got := bad.CalculateDiscount(cart); got != bad.Cents(tc.want) {
			t.Fatalf("%s: got %d, want %d", tc.name, got, tc.want)
		}
	}
}

func TestNewPoliciesExtendBehaviourWithoutModifyingTheCalculator(t *testing.T) {
	// A brand-new promotion, written without touching any production code.
	flatCoupon := good.DiscountPolicyFunc(func(good.Cart) good.Cents { return 1500 })
	calculator := good.NewDiscountCalculator(append(good.DefaultDiscounts(), flatCoupon)...)

	if got := calculator.CalculateDiscount(good.Cart{Tier: good.Premium, Subtotal: 10000, ItemCount: 1}); got != 1500 {
		t.Fatalf("got %d, want 1500", got)
	}
}

func TestDiscountNeverExceedsTheSubtotal(t *testing.T) {
	calculator := good.NewDiscountCalculator(good.DiscountPolicyFunc(func(good.Cart) good.Cents { return 5000 }))

	if got := calculator.CalculateDiscount(good.Cart{Subtotal: 3000, ItemCount: 1}); got != 3000 {
		t.Fatalf("got %d, want 3000", got)
	}
}
