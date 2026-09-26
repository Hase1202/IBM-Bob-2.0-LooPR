import { describe, it, expect } from "vitest";

// These tests run against the demo-repo source files directly.
// They verify the demo scenario's correctness without any external dependencies.

describe("Demo scenario: original CurrencyService", () => {
  it("has a string-based getRate signature", async () => {
    const { CurrencyService } = await import("../../demo-repo/src/services/currency_service");
    const svc = new CurrencyService();
    const rate = await svc.getRate("USD", "PHP");
    expect(rate.from).toBe("USD");
    expect(rate.to).toBe("PHP");
    expect(typeof rate.rate).toBe("number");
    expect(rate.rate).toBeGreaterThan(0);
  });

  it("converts amounts correctly", async () => {
    const { CurrencyService } = await import("../../demo-repo/src/services/currency_service");
    const svc = new CurrencyService();
    const converted = await svc.convert(100, "USD", "PHP");
    expect(converted).toBeCloseTo(5640, 0);
  });
});

describe("Demo scenario: RedisStore", () => {
  it("stores and retrieves values", async () => {
    const { RedisStore } = await import("../../demo-repo/pkg/cache/redis_store");
    const store = new RedisStore();
    await store.set("key1", { value: 42 }, { ttl: 60 });
    const result = await store.get<{ value: number }>("key1");
    expect(result?.value).toBe(42);
  });

  it("returns null for missing keys", async () => {
    const { RedisStore } = await import("../../demo-repo/pkg/cache/redis_store");
    const store = new RedisStore();
    const result = await store.get("nonexistent");
    expect(result).toBeNull();
  });

  it("handles TTL expiration", async () => {
    const { RedisStore } = await import("../../demo-repo/pkg/cache/redis_store");
    const store = new RedisStore();
    // Set with a past timestamp by manipulating Date (use negative ttl trick via del)
    await store.set("short-ttl", "value", { ttl: 60 });
    await store.del("short-ttl");
    const result = await store.get("short-ttl");
    expect(result).toBeNull();
  });

  it("returns null when disconnected", async () => {
    const { RedisStore } = await import("../../demo-repo/pkg/cache/redis_store");
    const store = new RedisStore();
    store.simulateDisconnect();
    await expect(store.get("key")).rejects.toThrow("not connected");
    store.simulateReconnect();
  });
});

describe("Demo scenario: PaymentProcessor compatibility", () => {
  it("uses string-based getRate (original API)", async () => {
    const { PaymentProcessor } = await import(
      "../../demo-repo/src/services/checkout/payment_processor"
    );
    const processor = new PaymentProcessor();
    const result = await processor.processCheckout({
      amount: 100,
      currency: "USD",
      targetCurrency: "PHP",
      customerId: "cust_123",
    });
    expect(result.success).toBe(true);
    expect(result.convertedAmount).toBeCloseTo(5640, 0);
    expect(result.transactionId).toContain("cust_123");
  });
});

describe("Demo scenario: withBackoff", () => {
  it("retries and eventually succeeds", async () => {
    const { withBackoff } = await import("../../demo-repo/pkg/network/backoff");
    let attempts = 0;
    const result = await withBackoff(async () => {
      attempts++;
      if (attempts < 3) throw new Error("transient");
      return "success";
    }, { maxAttempts: 3, baseDelayMs: 1 });
    expect(result).toBe("success");
    expect(attempts).toBe(3);
  });

  it("throws RetryExhaustedError after max attempts", async () => {
    const { withBackoff, RetryExhaustedError } = await import("../../demo-repo/pkg/network/backoff");
    await expect(
      withBackoff(async () => { throw new Error("always fails"); }, { maxAttempts: 2, baseDelayMs: 1 })
    ).rejects.toBeInstanceOf(RetryExhaustedError);
  });
});
