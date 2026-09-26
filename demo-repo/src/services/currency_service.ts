/**
 * CurrencyService — fetches live exchange rates from the external provider.
 *
 * ORIGINAL (pre-feature) implementation.
 * No caching; every call hits the external rate provider.
 */

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: number;
}

async function fetchFromProvider(
  from: string,
  to: string
): Promise<ExchangeRate> {
  // Simulate external HTTP call to rate provider
  await new Promise((r) => setTimeout(r, 20));
  const rates: Record<string, number> = {
    "USD-EUR": 0.92,
    "USD-PHP": 56.4,
    "EUR-USD": 1.09,
    "EUR-PHP": 61.5,
    "PHP-USD": 0.0177,
  };
  const key = `${from}-${to}`;
  const rate = rates[key];
  if (!rate) throw new Error(`Unknown currency pair: ${from}/${to}`);
  return { from, to, rate, timestamp: Date.now() };
}

export class CurrencyService {
  async getRate(from: string, to: string): Promise<ExchangeRate> {
    return fetchFromProvider(from, to);
  }

  async convert(amount: number, from: string, to: string): Promise<number> {
    const { rate } = await this.getRate(from, to);
    return amount * rate;
  }
}
