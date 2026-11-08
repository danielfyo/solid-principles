package good_test

import (
	"errors"
	"testing"

	"github.com/danielfyo/solid-principles-dotnet/go/srp/bad"
	"github.com/danielfyo/solid-principles-dotnet/go/srp/good"
)

var calculator = good.PriceCalculator{TaxRateBasisPoints: 2100}

func sampleOrder() good.Order {
	return good.Order{ID: "A-1", CustomerEmail: "ana@example.com",
		Lines: []good.OrderLine{{SKU: "BOOK", UnitPrice: 1000, Quantity: 2}}}
}

func newService() (*good.OrderService, *good.OrderRepository, *good.OrderConfirmationNotifier) {
	repository, notifier := good.NewOrderRepository(), &good.OrderConfirmationNotifier{}
	return good.NewOrderService(good.OrderValidator{}, calculator, repository, notifier), repository, notifier
}

func TestBadAndGoodComputeTheSameTotal(t *testing.T) {
	badTotal, err := bad.NewOrderService().PlaceOrder(bad.Order{ID: "A-1", CustomerEmail: "ana@example.com",
		Lines: []bad.OrderLine{{SKU: "BOOK", UnitPrice: 1000, Quantity: 2}}})
	if err != nil {
		t.Fatal(err)
	}
	if badTotal != 2420 || good.Cents(badTotal) != calculator.Calculate(sampleOrder()).Total {
		t.Fatalf("totals differ: bad=%d", badTotal)
	}
}

func TestPriceCalculatorSplitsSubtotalAndTax(t *testing.T) {
	got := calculator.Calculate(sampleOrder())
	want := good.OrderTotals{Subtotal: 2000, Tax: 420, Total: 2420}
	if got != want {
		t.Fatalf("got %+v, want %+v", got, want)
	}
}

func TestValidatorRejectsInvalidOrders(t *testing.T) {
	cases := map[string]good.Order{
		"bad email":     {ID: "A-2", CustomerEmail: "no-at-sign", Lines: []good.OrderLine{{"BOOK", 1000, 1}}},
		"zero quantity": {ID: "A-2", CustomerEmail: "ana@example.com", Lines: []good.OrderLine{{"BOOK", 1000, 0}}},
		"no lines":      {ID: "A-2", CustomerEmail: "ana@example.com"},
	}
	for name, order := range cases {
		t.Run(name, func(t *testing.T) {
			if err := (good.OrderValidator{}).Validate(order); !errors.Is(err, good.ErrInvalidOrder) {
				t.Fatalf("expected ErrInvalidOrder, got %v", err)
			}
		})
	}
}

func TestServiceCoordinatesTheCollaborators(t *testing.T) {
	service, repository, notifier := newService()

	totals, err := service.PlaceOrder(sampleOrder())
	if err != nil {
		t.Fatal(err)
	}
	if saved, ok := repository.FindTotals("A-1"); !ok || saved != totals {
		t.Fatalf("order not saved: %+v", saved)
	}
	want := "To: ana@example.com | Order A-1 confirmed | Total: 24.20 EUR"
	if len(notifier.SentMessages) != 1 || notifier.SentMessages[0] != want {
		t.Fatalf("unexpected messages: %v", notifier.SentMessages)
	}
}

func TestServiceDoesNotSaveOrNotifyInvalidOrders(t *testing.T) {
	service, repository, notifier := newService()

	if _, err := service.PlaceOrder(good.Order{ID: "A-3", CustomerEmail: "ana@example.com"}); err == nil {
		t.Fatal("expected an error")
	}
	if _, ok := repository.FindTotals("A-3"); ok || len(notifier.SentMessages) != 0 {
		t.Fatal("invalid order must not be saved or notified")
	}
}
