/**
 * RedisStore — company-approved shared caching abstraction.
 *
 * ADR-008: All services requiring caching MUST use this abstraction.
 * ADR-012: Services must NOT instantiate Redis clients directly.
 */

export interface CacheOptions {
  ttl?: number; // time-to-live in seconds
}

export interface CacheStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  flush(): Promise<void>;
}

/**
 * In-memory implementation of the shared cache abstraction.
 * In production this wraps ioredis; here we use a Map for demo purposes.
 */
export class RedisStore implements CacheStore {
  private store = new Map<string, { value: unknown; expiresAt: number | null }>();
  private connected = true;

  constructor(_config?: { host?: string; port?: number; db?: number }) {
    // In production: this would initialize ioredis with the provided config.
    // The connection pool is owned exclusively by this class (ADR-012).
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.connected) throw new Error("RedisStore: not connected");
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    if (!this.connected) throw new Error("RedisStore: not connected");
    const expiresAt =
      options?.ttl != null ? Date.now() + options.ttl * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  async flush(): Promise<void> {
    this.store.clear();
  }

  /** Simulate connection loss for testing */
  simulateDisconnect(): void {
    this.connected = false;
  }

  simulateReconnect(): void {
    this.connected = true;
  }
}

export const sharedCache = new RedisStore({ host: "localhost", port: 6379 });
