namespace SolidPrinciples.Ocp.Good;

/// <summary>
/// The extension point. New promotions are new classes implementing this
/// interface; existing, tested code is never edited.
/// </summary>
public interface IDiscountPolicy
{
    decimal DiscountFor(Cart cart);
}
