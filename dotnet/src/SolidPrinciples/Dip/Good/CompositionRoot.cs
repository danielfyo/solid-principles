using SolidPrinciples.Dip.Good.Infrastructure;

namespace SolidPrinciples.Dip.Good;

/// <summary>
/// The only place that knows about concrete classes. In ASP.NET Core this is
/// <c>builder.Services.AddScoped&lt;IPaymentGateway, StripePaymentGateway&gt;()</c>.
/// </summary>
public static class CompositionRoot
{
    public static CheckoutService CreateCheckoutService() =>
        new(
            new StripePaymentGateway(new StripeApiClient()),
            new EmailCustomerNotifier(new SmtpEmailSender()));
}
