/** Stand-in for a third-party payment SDK, exported as a module singleton. */
export const stripeClient = {
  async createCharge(customerEmail: string, amountInCents: number): Promise<string> {
    // Imagine a real HTTP call here: network, API keys, rate limits...
    console.log(`[stripe] charging ${amountInCents} cents to ${customerEmail}`);
    return `ch_${Date.now()}`;
  },
};
