/**
 * CurrencyService — FLAWED IMPLEMENTATION (PR #142)
 *
 * ⚠️  INTENTIONAL ARCHITECTURAL VIOLATIONS for IntentLoop demo:
 *
 * VIOLATION 1 (ADR-012): Creates a direct RedisClient instead of using
 *   the shared RedisStore abstraction from pkg/cache/redis_store.ts
 *
 * VIOLATION 2: Changes the getRate() signature from (string, string) to
 *   (CurrencyEnum, CurrencyEnum) without updating PaymentProcessor —
 *   this introduces a silent compatibility break in an unmodified consumer.
 */

import { withBackoff } from "../../pkg/network/backoff";

// ⚠️ VIOLATION 1: Direct Redis client — prohibited by ADR-012
class RedisClient {
  private store = new Map<string, { value: string; expiresAt: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.expiresAt) return null;
    return entry.value;
  }

  async set(key: string, value: string, _opts?: { EX?: number }): Promise<void> {
    const ttl = _opts?.EX ?? 60;
    this.store.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
  }
}

// ⚠️ VIOLATION 2: New enum-based currency type — breaks string-based callers
export enum CurrencyEnum {
  USD = "USD",
  EUR = "EUR",
  PHP = "PHP",
  GBP = "GBP",
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: number;
}

async function fetchFromProvider(from: string, to: string): Promise<ExchangeRate> {
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
  // ⚠️ VIOLATION 1: Instantiates its own cache client (violates ADR-012)
  private cache = new RedisClient();

  // ⚠️ VIOLATION 2: Signature changed from (string, string) → (CurrencyEnum, CurrencyEnum)
  // PaymentProcessor still calls getRate("USD", "PHP") — this breaks silently
  async getRate(from: CurrencyEnum, to: CurrencyEnum): Promise<ExchangeRate> {
    const cacheKey = `rate:${from}:${to}`;

    try {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as ExchangeRate;
      }
    } catch {
      // cache failure — fall through
    }

    const result = await withBackoff(
      () => fetchFromProvider(from, to),
      { maxAttempts: 3, baseDelayMs: 200 }
    );

    try {
      await this.cache.set(cacheKey, JSON.stringify(result), { EX: 60 });
    } catch {
      // cache write failure — ignore
    }

    return result;
  }

  async convert(amount: number, from: CurrencyEnum, to: CurrencyEnum): Promise<number> {
    const { rate } = await this.getRate(from, to);
    return amount * rate;
  }
}
