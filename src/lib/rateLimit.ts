/**
 * Approved rate limiting abstraction.
 *
 * ADR-021: All API routes MUST use this shared RateLimiter.
 * Do NOT implement in-memory counters directly in route handlers.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // unix ms
}

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

/**
 * Check and increment the rate limit for a given key.
 * @param key      - identifier (e.g. IP address or user ID)
 * @param limit    - max requests per window
 * @param windowMs - window size in milliseconds
 */
export function limit(
  key: string,
  limit: number = 60,
  windowMs: number = 60_000
): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  bucket.count += 1;
  const allowed = bucket.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
  };
}
