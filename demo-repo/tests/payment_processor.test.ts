import { describe, it, expect } from "vitest";

describe("PaymentProcessor", () => {
  it("processes checkout with USD to PHP conversion", async () => {
    const { PaymentProcessor } = await import("../../demo-repo/src/services/checkout/payment_processor");
    const processor = new PaymentProcessor();
    const result = await processor.processCheckout({
      amount: 1000,
      currency: "USD",
      targetCurrency: "PHP",
      customerId: "customer_001",
    });
    expect(result.success).toBe(true);
    expect(result.convertedAmount).toBe(1000 * 56.4);
    expect(result.transactionId).toContain("customer_001");
  });

  it("processes checkout with EUR to USD conversion", async () => {
    const { PaymentProcessor } = await import("../../demo-repo/src/services/checkout/payment_processor");
    const processor = new PaymentProcessor();
    const result = await processor.processCheckout({
      amount: 200,
      currency: "EUR",
      targetCurrency: "USD",
      customerId: "customer_002",
    });
    expect(result.success).toBe(true);
    expect(result.convertedAmount).toBeCloseTo(200 * 1.09, 2);
  });
});
