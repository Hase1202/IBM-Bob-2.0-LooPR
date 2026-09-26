# ADR-008: Shared Cache Abstraction

**Status:** Accepted  
**Date:** 2024-01-15  
**Deciders:** Platform Team, Backend Guild  

---

## Context

Multiple services in the platform have independently begun introducing caching logic. Without a unified approach, this has led to:

- Inconsistent cache key namespacing (collisions across services)
- Different TTL strategies causing stale-data bugs
- Duplicated infrastructure and connection overhead
- Difficulty observing cache health across the system
- Per-service cache implementations that are hard to test in isolation

The platform has standardized on Redis as the cache layer.

---

## Decision

**Services requiring caching MUST use the shared `RedisStore` abstraction** located at:

```
pkg/cache/redis_store.ts
```

Direct Redis client usage inside individual service implementations is prohibited (see ADR-012).

---

## Consequences

### Benefits

- **Consistent cache behavior** — All services share TTL conventions, key prefixes, and serialization strategies.
- **Centralized lifecycle management** — Connection pooling, reconnection, and teardown are owned by one component.
- **Easier testing** — Services depend on the `CacheStore` interface, which is trivially mockable.
- **Observability** — Cache hit rates, miss rates, and evictions are instrumented in one place.
- **Less duplicated infrastructure** — One connection pool serves all services instead of N separate pools.

### Constraints

- New services must accept `CacheStore` via dependency injection rather than instantiating it directly.
- The `RedisStore` constructor should be called only at application bootstrap, not inside individual service constructors.

---

## Alternatives Rejected

### Service-Local Cache Clients

Each service manages its own Redis connection.

**Rejected because:** This is the exact problem we are solving. It leads to connection exhaustion under load and makes cache configuration drift inevitable.

### In-Memory LRU Cache Per Service

Use a non-Redis in-memory cache inside each service.

**Rejected because:** Does not survive process restarts and cannot be shared across horizontally scaled instances.

---

## Compliance

Violations of this ADR should be flagged in code review.  
Automated tooling should detect `new Redis(` and `createClient(` inside service files.
