package good

import (
	"context"
	"fmt"
)

// --- Low-level details (in a real project: package infrastructure) ---------

// StripeAPIClient is a stand-in for a third-party payment SDK we do not control.
type StripeAPIClient struct{ sequence int }

func (c *StripeAPIClient) CreateCharge(_ context.Context, email string, amountCents int64) (string, error) {
	fmt.Printf("[stripe] charging %d cents to %s\n", amountCents, email)
	c.sequence++
	return fmt.Sprintf("ch_%d", c.sequence), nil
}

type SMTPEmailSender struct{}

func (SMTPEmailSender) Send(_ context.Context, to, subject, body string) error {
	fmt.Printf("[smtp] to=%s subject=%s body=%s\n", to, subject, body)
	return nil
}

// StripePaymentGateway ✅ adapter: the detail implements the policy's abstraction.
type StripePaymentGateway struct{ Client *StripeAPIClient }

func (g StripePaymentGateway) Charge(ctx context.Context, email string, amountCents int64) (PaymentResult, error) {
	id, err := g.Client.CreateCharge(ctx, email, amountCents)
	if err != nil {
		return PaymentResult{}, err
	}
	return Approved(id), nil
}

type EmailCustomerNotifier struct{ SMTP SMTPEmailSender }

func (n EmailCustomerNotifier) Notify(ctx context.Context, email, message string) error {
	return n.SMTP.Send(ctx, email, "Thanks for your order", message)
}

// NewDefaultCheckoutService is the composition root: the only place that knows
// the concrete types. In a real app this lives in main().
func NewDefaultCheckoutService() *CheckoutService {
	return NewCheckoutService(
		StripePaymentGateway{Client: &StripeAPIClient{}},
		EmailCustomerNotifier{SMTP: SMTPEmailSender{}},
	)
}
