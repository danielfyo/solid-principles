namespace SolidPrinciples.Isp.Good;

public sealed record StoredOrder(string Id, string CustomerName, decimal Total, DateOnly PlacedOn);
