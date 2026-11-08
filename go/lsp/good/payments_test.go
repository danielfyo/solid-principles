package good_test

import (
	"errors"
	"testing"

	"github.com/danielfyo/solid-principles-dotnet/go/lsp/bad"
	"github.com/danielfyo/solid-principles-dotnet/go/lsp/good"
)

func TestBadHierarchyBreaksCallersThatTrustTheInterface(t *testing.T) {
	giftCard := bad.NewGiftCard()
	receipt, _ := giftCard.Charge(2500)

	// The caller did nothing wrong, yet substitution fails at runtime.
	if err := bad.RefundOrder(giftCard, receipt); !errors.Is(err, bad.ErrNotSupported) {
		t.Fatalf("expected ErrNotSupported, got %v", err)
	}
}

// Contract tests: ONE suite that every implementation must pass.
var allMethods = map[string]func() good.PaymentMethod{
	"card":     func() good.PaymentMethod { return good.NewCreditCard() },
	"paypal":   func() good.PaymentMethod { return good.NewPayPal() },
	"giftcard": func() good.PaymentMethod { return good.NewGiftCard() },
}

var refundableMethods = map[string]func() good.Refundable{
	"card":   func() good.Refundable { return good.NewCreditCard() },
	"paypal": func() good.Refundable { return good.NewPayPal() },
}

func TestEveryMethodHonoursTheChargeContract(t *testing.T) {
	for name, create := range allMethods {
		t.Run(name, func(t *testing.T) {
			receipt, err := good.Pay(create(), 4250)
			if err != nil || receipt.AmountCents != 4250 || receipt.TransactionID == "" {
				t.Fatalf("unexpected receipt %+v, err %v", receipt, err)
			}
			if _, err := create().Charge(0); !errors.Is(err, good.ErrInvalidAmount) {
				t.Fatalf("expected ErrInvalidAmount, got %v", err)
			}
		})
	}
}

func TestEveryRefundableMethodRefundsItsOwnReceiptsOnce(t *testing.T) {
	for name, create := range refundableMethods {
		t.Run(name, func(t *testing.T) {
			method := create()
			receipt, _ := method.Charge(1000)

			if err := good.RefundOrder(method, receipt); err != nil {
				t.Fatal(err)
			}
			if err := good.RefundOrder(method, receipt); !errors.Is(err, good.ErrUnknownTransaction) {
				t.Fatalf("expected ErrUnknownTransaction, got %v", err)
			}
		})
	}
}

func TestGiftCardsAreSimplyNotRefundable(t *testing.T) {
	// good.RefundOrder(good.NewGiftCard(), receipt) // ⛔ does not compile
	var method good.PaymentMethod = good.NewGiftCard()
	if _, ok := method.(good.Refundable); ok {
		t.Fatal("gift cards must not claim to be refundable")
	}
}
