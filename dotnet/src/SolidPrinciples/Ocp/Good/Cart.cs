namespace SolidPrinciples.Ocp.Good;

public enum CustomerTier
{
    Regular,
    Premium,
    Vip,
}

public sealed record Cart(CustomerTier Tier, decimal Subtotal, int ItemCount);
