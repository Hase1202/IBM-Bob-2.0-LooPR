# ADR-012: Redis Connection Ownership

**Status:** Accepted  
**Date:** 2024-02-03  
**Deciders:** Platform Team, SRE  
**Supersedes:** —  
**Related:** ADR-008

---

## Context

Following the adoption of `RedisStore` (ADR-008), several services were found to still be creating Redis clients directly alongside their use of the shared abstraction. This occurred because:

- Developers were unfamiliar with the shared abstraction's API
- Some services needed Redis features not yet exposed by `RedisStore`
- Services copied patterns from older codebases

The result was duplicate connection pools, resource exhaustion incidents in staging, and configuration drift (different services pointing at different Redis instances).

---

## Decision

**Services MUST NOT instantiate Redis clients directly.**

Specifically, the following patterns are prohibited inside any `src/` service file:

```typescript
new Redis(...)         // ioredis
createClient(...)      // node-redis
new IORedis(...)
```

**Redis connection ownership belongs exclusively to `RedisStore`.**

---

## Enforcement

1. `RedisStore` is the single entry point for all cache operations.
2. If a service requires a Redis capability not exposed by `RedisStore`, the correct action is to extend `RedisStore` — not to bypass it.
3. Services receive `CacheStore` via constructor injection (dependency injection pattern).
4. Automated checks and PR review gates should scan for `new Redis(` and `createClient(` in service directories.

---

## Consequences

### Benefits

- **Avoid duplicate connection pools** — one pool per application instance, not per service.
- **Prevent resource exhaustion** — staging incidents caused by N×default-pool-size connections are eliminated.
- **Centralize configuration** — host, port, TLS, and auth are set in one place at bootstrap.
- **Avoid duplicated infrastructure** — fewer moving parts to monitor, restart, or debug.

### Constraints

- Existing violations must be refactored. A migration guide is in `docs/migration/redis-refactor.md`.
- Integration tests must inject `RedisStore` or a mock; they must not spin up real Redis for unit-level tests.

---

## Examples

### Compliant

```typescript
// At bootstrap (app.ts)
const cache = new RedisStore({ host: process.env.REDIS_HOST });

// In service constructor
class CurrencyService {
  constructor(private cache: CacheStore) {}
}
```

### Non-Compliant (violates this ADR)

```typescript
// Inside service file — PROHIBITED
import Redis from "ioredis";
const redis = new Redis({ host: "localhost" });

// Or
const client = createClient();
```
