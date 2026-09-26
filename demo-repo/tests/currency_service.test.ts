import { describe, it, expect } from "vitest";

// Tests for the original currency service (pre-feature)
// These represent the existing test suite that must continue to pass.

describe("CurrencyService - original implementation", () => {
  it("fetches USD/PHP rate", async () => {
    const { CurrencyService } = await import("../../demo-repo/src/services/currency_service");
    const svc = new CurrencyService();
    const rate = await svc.getRate("USD", "PHP");
    expect(rate.rate).toBe(56.4);
    expect(rate.from).toBe("USD");
    expect(rate.to).toBe("PHP");
    expect(rate.timestamp).toBeGreaterThan(0);
  });

  it("fetches EUR/USD rate", async () => {
    const { CurrencyService } = await import("../../demo-repo/src/services/currency_service");
    const svc = new CurrencyService();
    const rate = await svc.getRate("EUR", "USD");
    expect(rate.rate).toBe(1.09);
  });

  it("throws for unknown pair", async () => {
    const { CurrencyService } = await import("../../demo-repo/src/services/currency_service");
    const svc = new CurrencyService();
    await expect(svc.getRate("XYZ", "ABC")).rejects.toThrow("Unknown currency pair");
  });

  it("converts currency amounts", async () => {
    const { CurrencyService } = await import("../../demo-repo/src/services/currency_service");
    const svc = new CurrencyService();
    const result = await svc.convert(50, "EUR", "PHP");
    expect(result).toBe(50 * 61.5);
  });
});
