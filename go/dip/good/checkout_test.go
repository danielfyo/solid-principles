package good_test

import (
	"context"
	"fmt"
	"testing"

	"github.com/danielfyo/solid-principles-dotnet/go/dip/good"
)

type fakeGateway struct {
	result  good.PaymentResult
	charges []string
}

func (f *fakeGateway) Charge(_ context.Context, email string, amountCents int64) (good.PaymentResult, error) {
	f.charges = append(f.charges, fmt.Sprintf("%s:%d", email, amountCents))
	return f.result, nil
}

type spyNotifier struct{ messages []string }

func (s *spyNotifier) Notify(_ context.Context, email, message string) error {
	s.messages = append(s.messages, email+": "+message)
	return nil
}

func TestSuccessfulCheckoutNotifiesTheCustomer(t *testing.T) {
	gateway, notifier := &fakeGateway{result: good.Approved("tx_1")}, &spyNotifier{}

	result, err := good.NewCheckoutService(gateway, notifier).Checkout(context.Background(), "ana@example.com", 2420)

	if err != nil || !result.Succeeded {
		t.Fatalf("unexpected result %+v, err %v", result, err)
	}
	if len(gateway.charges) != 1 || gateway.charges[0] != "ana@example.com:2420" {
		t.Fatalf("unexpected charges %v", gateway.charges)
	}
	want := "ana@example.com: Payment of 24.20 EUR received (tx_1)."
	if len(notifier.messages) != 1 || notifier.messages[0] != want {
		t.Fatalf("unexpected messages %v", notifier.messages)
	}
}

func TestDeclinedPaymentIsEasyToSimulateAndSendsNothing(t *testing.T) {
	notifier := &spyNotifier{}
	gateway := &fakeGateway{result: good.Declined("insufficient funds")}

	result, _ := good.NewCheckoutService(gateway, notifier).Checkout(context.Background(), "ana@example.com", 2420)

	if result != (good.CheckoutResult{Message: "Payment declined: insufficient funds"}) || len(notifier.messages) != 0 {
		t.Fatalf("unexpected result %+v / messages %v", result, notifier.messages)
	}
}

func TestCompositionRootWiresTheRealAdapters(t *testing.T) {
	result, err := good.NewDefaultCheckoutService().Checkout(context.Background(), "ana@example.com", 1000)

	if err != nil || result.Message != "Payment of 10.00 EUR received (ch_1)." {
		t.Fatalf("unexpected result %+v, err %v", result, err)
	}
}
