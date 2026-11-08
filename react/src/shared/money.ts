/** Money as integer cents to avoid floating-point errors. */
export type Cents = number;

const eur = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });

export const formatMoney = (amount: Cents): string => eur.format(amount / 100);
