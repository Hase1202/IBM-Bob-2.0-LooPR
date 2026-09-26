# Ticket: Currency Rate Caching

**ID:** PLAT-447  
**Type:** Feature  
**Priority:** Medium  
**Team:** Platform / Checkout  
**Reporter:** @jkim  
**Assignee:** TBD  

---

## Summary

Add caching for currency exchange rate responses to reduce unnecessary calls to the external rate provider.

---

## Background

`CurrencyService.getRate()` is called on every checkout calculation. During peak traffic, the external rate provider is hit hundreds of times per minute for the same currency pairs. Exchange rates change infrequently (at most once per minute) but we are fetching them on every request.

This causes:

- Unnecessary latency in checkout flow
- Rate-limiting risk from the external provider
- Wasted compute and network overhead

---

## Requirements

1. **Cache exchange-rate responses** — cache results by currency pair with a configurable TTL (default: 60 seconds).

2. **Reuse the existing cache infrastructure** — use `pkg/cache/redis_store.ts` (the approved shared abstraction per ADR-008). Do NOT create a new Redis client inside `CurrencyService` (ADR-012).

3. **Retry failed external API calls** — use the existing `pkg/network/backoff.ts` utility for retries on transient provider failures.

4. **Preserve checkout compatibility** — `CurrencyService.getRate(from: string, to: string)` interface must remain unchanged. `PaymentProcessor` and other consumers must not require modification.

5. **Gracefully handle cache failures** — if the cache is unavailable, fall through to the live provider without disrupting checkout.

---

## Acceptance Criteria

- [ ] `getRate("USD", "PHP")` returns a cached result on the second call within TTL
- [ ] Cache miss falls through to provider without error
- [ ] Cache failure (store unavailable) falls through to provider without error  
- [ ] Provider failure triggers retry with backoff (max 3 attempts)
- [ ] `PaymentProcessor` continues to work without any changes
- [ ] Existing tests pass

---

## Architecture Notes

The approved approach:

```
CurrencyService
      ↓
RedisStore (CacheStore interface)
      ↓
Shared Cache

CurrencyService
      ↓
withBackoff()
      ↓
External Rate Provider
```

Do NOT implement:

```
CurrencyService
      ↓
new Redis() / new RedisClient()  ← violates ADR-012
```

---

## Related

- ADR-008: Cache Abstraction
- ADR-012: Redis Connection Ownership
- `pkg/cache/redis_store.ts`
- `pkg/network/backoff.ts`
