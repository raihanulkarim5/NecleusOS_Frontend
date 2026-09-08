const CURRENCY_SYMBOLS: Record<string, string> = {
  BDT: '৳',
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

/** Formats an amount with the right currency symbol (defaults to BDT, the app's primary currency). */
export function formatMoney(amount: number, currency: string = 'BDT'): string {
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()];
  const value = amount.toFixed(2);
  return symbol ? `${symbol}${value}` : `${currency} ${value}`;
}
