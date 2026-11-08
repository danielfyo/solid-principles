package good

// OrderService ✅ only coordinates the workflow; every decision lives in a collaborator.
type OrderService struct {
	validator  OrderValidator
	calculator PriceCalculator
	repository *OrderRepository
	notifier   *OrderConfirmationNotifier
}

func NewOrderService(
	validator OrderValidator,
	calculator PriceCalculator,
	repository *OrderRepository,
	notifier *OrderConfirmationNotifier,
) *OrderService {
	return &OrderService{validator, calculator, repository, notifier}
}

func (s *OrderService) PlaceOrder(order Order) (OrderTotals, error) {
	if err := s.validator.Validate(order); err != nil {
		return OrderTotals{}, err
	}
	totals := s.calculator.Calculate(order)
	s.repository.Save(order, totals)
	s.notifier.NotifyOrderPlaced(order, totals)
	return totals, nil
}
