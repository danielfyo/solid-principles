// Package good shows DIP applied: the policy owns its abstractions and the
// details (adapters) plug into them.
package good

import (
	"context"
	"fmt"
)

// ✅ Abstractions owned by the high-level policy, in business language.

type PaymentResult struct {
	Succeeded     bool
	TransactionID string
	Error         string
}

func Approved(transactionID string) PaymentResult {
	return PaymentResult{Succeeded: true, TransactionID: transactionID}
}

func Declined(reason string) PaymentResult { return PaymentResult{Error: reason} }

type PaymentGateway interface {
	Charge(ctx context.Context, customerEmail string, amountCents int64) (PaymentResult, error)
}

type CustomerNotifier interface {
	Notify(ctx context.Context, customerEmail, message string) error
}

type CheckoutResult struct {
	Succeeded bool
	Message   string
}

// CheckoutService ✅ depends only on abstractions; knows nothing about Stripe or SMTP.
type CheckoutService struct {
	payments PaymentGateway
	notifier CustomerNotifier
}

func NewCheckoutService(payments PaymentGateway, notifier CustomerNotifier) *CheckoutService {
	return &CheckoutService{payments: payments, notifier: notifier}
}

func (s *CheckoutService) Checkout(ctx context.Context, email string, amountCents int64) (CheckoutResult, error) {
	payment, err := s.payments.Charge(ctx, email, amountCents)
	if err != nil {
		return CheckoutResult{}, fmt.Errorf("charging customer: %w", err)
	}
	if !payment.Succeeded {
		return CheckoutResult{Message: "Payment declined: " + payment.Error}, nil
	}

	message := fmt.Sprintf("Payment of %d.%02d EUR received (%s).", amountCents/100, amountCents%100, payment.TransactionID)
	if err := s.notifier.Notify(ctx, email, message); err != nil {
		return CheckoutResult{}, fmt.Errorf("notifying customer: %w", err)
	}
	return CheckoutResult{Succeeded: true, Message: message}, nil
}
