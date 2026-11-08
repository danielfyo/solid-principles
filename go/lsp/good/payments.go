// Package good shows LSP applied: only promise what every implementation can deliver.
package good

import (
	"errors"
	"fmt"
)

// ErrInvalidAmount is returned by every PaymentMethod for non-positive amounts.
var ErrInvalidAmount = errors.New("amount must be positive")

// ErrUnknownTransaction is returned by every Refundable for foreign or reused receipts.
var ErrUnknownTransaction = errors.New("unknown transaction")

type Receipt struct {
	TransactionID string
	AmountCents   int64
}

// PaymentMethod contract: amount must be positive (else ErrInvalidAmount);
// returns a receipt for exactly that amount.
type PaymentMethod interface {
	Charge(amountCents int64) (Receipt, error)
}

// Refundable is a richer promise, made only by types that can keep it.
// Contract: refunding a receipt issued by this method succeeds exactly once.
type Refundable interface {
	PaymentMethod
	Refund(receipt Receipt) error
}

// Compile-time proof of which types satisfy which contract.
var (
	_ Refundable    = (*CreditCard)(nil)
	_ Refundable    = (*PayPal)(nil)
	_ PaymentMethod = (*GiftCard)(nil)
)

// ledger is shared bookkeeping, reused through composition (embedding).
type ledger struct {
	prefix   string
	sequence int
	issued   map[string]bool
}

func newLedger(prefix string) *ledger { return &ledger{prefix: prefix, issued: map[string]bool{}} }

func (l *ledger) Charge(amountCents int64) (Receipt, error) {
	if amountCents <= 0 {
		return Receipt{}, ErrInvalidAmount
	}
	l.sequence++
	receipt := Receipt{TransactionID: fmt.Sprintf("%s-%d", l.prefix, l.sequence), AmountCents: amountCents}
	l.issued[receipt.TransactionID] = true
	return receipt, nil
}

func (l *ledger) refund(receipt Receipt) error {
	if !l.issued[receipt.TransactionID] {
		return fmt.Errorf("%w: %s", ErrUnknownTransaction, receipt.TransactionID)
	}
	delete(l.issued, receipt.TransactionID)
	return nil
}

type CreditCard struct{ *ledger }

func NewCreditCard() *CreditCard                   { return &CreditCard{newLedger("card")} }
func (c *CreditCard) Refund(receipt Receipt) error { return c.refund(receipt) }

type PayPal struct{ *ledger }

func NewPayPal() *PayPal                       { return &PayPal{newLedger("paypal")} }
func (p *PayPal) Refund(receipt Receipt) error { return p.refund(receipt) }

// GiftCard ✅ only promises what it can deliver: it can be charged.
type GiftCard struct{ *ledger }

func NewGiftCard() *GiftCard { return &GiftCard{newLedger("giftcard")} }

// Pay works with every payment method, no type switches needed.
func Pay(method PaymentMethod, amountCents int64) (Receipt, error) {
	return method.Charge(amountCents)
}

// RefundOrder ✅ asks only for refundable methods: passing a GiftCard does not compile.
func RefundOrder(method Refundable, receipt Receipt) error {
	return method.Refund(receipt)
}
