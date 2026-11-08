namespace SolidPrinciples.Srp.Good;

public sealed record OrderLine(string Sku, decimal UnitPrice, int Quantity);

public sealed record Order(string Id, string CustomerEmail, IReadOnlyList<OrderLine> Lines);

public sealed record OrderTotals(decimal Subtotal, decimal Tax, decimal Total);

public sealed class InvalidOrderException(string message) : Exception(message);
