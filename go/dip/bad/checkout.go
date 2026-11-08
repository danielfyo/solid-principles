// Package bad shows a DIP violation: business policy creates concrete details.
package bad

import (
	"context"
	"fmt"
)

// StripeAPIClient is a stand-in for a third-party payment SDK (low-level detail).
type StripeAPIClient struct{ sequence int }

func (c *StripeAPIClient) CreateCharge(_ context.Context, email string, amountCents int64) (string, error) {
	// Imagine a real HTTP call here: network, API keys, rate limits...
	fmt.Printf("[stripe] charging %d cents to %s\n", amountCents, email)
	c.sequence++
	return fmt.Sprintf("ch_%d", c.sequence), nil
}

// SMTPEmailSender is a stand-in for an SMTP library (low-level detail).
type SMTPEmailSender struct{}

func (SMTPEmailSender) Send(_ context.Context, to, subject, body string) error {
	fmt.Printf("[smtp] to=%s subject=%s body=%s\n", to, subject, body)
	return nil
}

type CheckoutResult struct {
	Succeeded bool
	Message   string
}

// CheckoutService ❌ is hard-wired to Stripe and SMTP: untestable in isolation,
// cannot simulate a declined card, and switching provider means rewriting it.
type CheckoutService struct {
	stripe *StripeAPIClient
	email  SMTPEmailSender
}

func NewCheckoutService() *CheckoutService {
	return &CheckoutService{stripe: &StripeAPIClient{}, email: SMTPEmailSender{}}
}

func (s *CheckoutService) Checkout(ctx context.Context, email string, amountCents int64) (CheckoutResult, error) {
	chargeID, err := s.stripe.CreateCharge(ctx, email, amountCents)
	if err != nil {
		return CheckoutResult{}, err
	}
	body := fmt.Sprintf("Payment of %d.%02d EUR received (%s).", amountCents/100, amountCents%100, chargeID)
	if err := s.email.Send(ctx, email, "Thanks for your order", body); err != nil {
		return CheckoutResult{}, err
	}
	return CheckoutResult{Succeeded: true, Message: body}, nil
}
