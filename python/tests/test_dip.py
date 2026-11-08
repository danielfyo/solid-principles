from decimal import Decimal

from solid.dip.good import CheckoutResult, CheckoutService, PaymentResult, create_checkout_service


class FakePaymentGateway:
    def __init__(self, result: PaymentResult) -> None:
        self._result = result
        self.charges: list[tuple[str, Decimal]] = []

    def charge(self, customer_email: str, amount: Decimal) -> PaymentResult:
        self.charges.append((customer_email, amount))
        return self._result


class SpyNotifier:
    def __init__(self) -> None:
        self.messages: list[str] = []

    def notify(self, customer_email: str, message: str) -> None:
        self.messages.append(f"{customer_email}: {message}")


def test_successful_checkout_notifies_the_customer() -> None:
    gateway = FakePaymentGateway(PaymentResult.approved("tx_1"))
    notifier = SpyNotifier()

    result = CheckoutService(gateway, notifier).checkout("ana@example.com", Decimal("24.20"))

    assert result.succeeded
    assert gateway.charges == [("ana@example.com", Decimal("24.20"))]
    assert notifier.messages == ["ana@example.com: Payment of 24.20 EUR received (tx_1)."]


def test_declined_payment_is_easy_to_simulate_and_sends_nothing() -> None:
    notifier = SpyNotifier()
    gateway = FakePaymentGateway(PaymentResult.declined("insufficient funds"))

    result = CheckoutService(gateway, notifier).checkout("ana@example.com", Decimal("24.20"))

    assert result == CheckoutResult(False, "Payment declined: insufficient funds")
    assert notifier.messages == []


def test_composition_root_wires_the_real_adapters() -> None:
    result = create_checkout_service().checkout("ana@example.com", Decimal(10))

    assert result.message == "Payment of 10.00 EUR received (ch_1)."
