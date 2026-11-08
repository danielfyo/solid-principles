// Package bad shows an LSP violation: an implementation that breaks the contract.
package bad

import (
	"errors"
	"fmt"
)

// ErrNotSupported is the tell-tale sign of a broken promise.
var ErrNotSupported = errors.New("operation not supported")

type Receipt struct {
	TransactionID string
	AmountCents   int64
}

// PaymentMethod promises that every payment method can be charged AND refunded.
type PaymentMethod interface {
	Charge(amountCents int64) (Receipt, error)
	Refund(receipt Receipt) error
}

type ledger struct {
	prefix   string
	sequence int
	issued   map[string]bool
}

func newLedger(prefix string) *ledger { return &ledger{prefix: prefix, issued: map[string]bool{}} }

func (l *ledger) record(amountCents int64) (Receipt, error) {
	if amountCents <= 0 {
		return Receipt{}, errors.New("amount must be positive")
	}
	l.sequence++
	receipt := Receipt{TransactionID: fmt.Sprintf("%s-%d", l.prefix, l.sequence), AmountCents: amountCents}
	l.issued[receipt.TransactionID] = true
	return receipt, nil
}

func (l *ledger) reverse(receipt Receipt) error {
	if !l.issued[receipt.TransactionID] {
		return fmt.Errorf("unknown transaction %s", receipt.TransactionID)
	}
	delete(l.issued, receipt.TransactionID)
	return nil
}

type CreditCard struct{ l *ledger }

func NewCreditCard() *CreditCard                           { return &CreditCard{newLedger("card")} }
func (c *CreditCard) Charge(amount int64) (Receipt, error) { return c.l.record(amount) }
func (c *CreditCard) Refund(receipt Receipt) error         { return c.l.reverse(receipt) }

// GiftCard ❌ satisfies the interface's method set, but not its behavioural contract.
type GiftCard struct{ l *ledger }

func NewGiftCard() *GiftCard                             { return &GiftCard{newLedger("giftcard")} }
func (g *GiftCard) Charge(amount int64) (Receipt, error) { return g.l.record(amount) }
func (g *GiftCard) Refund(Receipt) error                 { return ErrNotSupported }

// RefundOrder is written against the interface, as it should be... and still fails.
func RefundOrder(method PaymentMethod, receipt Receipt) error {
	return method.Refund(receipt) // 💥 ErrNotSupported for gift cards
}
