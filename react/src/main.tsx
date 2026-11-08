import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ServicesProvider, type Services } from "./dip/good/ServicesContext";
import { StripePaymentGateway } from "./dip/good/stripePaymentGateway";

// Composition root: the ONLY place that knows which concrete adapters are used.
// Swap the client for the real SDK, a sandbox, or a fake for demos.
const services: Services = {
  payments: new StripePaymentGateway({
    createCharge: async (email, cents) => {
      console.log(`[demo stripe] charging ${cents} cents to ${email}`);
      return `ch_demo_${Date.now()}`;
    },
  }),
};

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root element.");

createRoot(container).render(
  <StrictMode>
    <ServicesProvider services={services}>
      <App />
    </ServicesProvider>
  </StrictMode>,
);
