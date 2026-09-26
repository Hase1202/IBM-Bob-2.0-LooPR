/**
 * Demo Mode data — provides a complete self-contained scenario
 * when GitHub OAuth is not configured.
 */

export const DEMO_REPO = {
  id: "demo-ecommerce",
  name: "ecommerce-platform",
  fullName: "demo/ecommerce-platform",
  description: "Enterprise e-commerce checkout platform",
  isDemo: true,
};

export const DEMO_CONTRACTS = [
  {
    id: "contract-currency-cache",
    feature: "Currency Rate Caching",
    status: "active",
    description: "Cache currency exchange rates used during checkout.",
  },
  {
    id: "contract-payment-retry",
    feature: "Payment Retry System",
    status: "verified",
    description: "Retry failed payment gateway calls with exponential backoff.",
  },
  {
    id: "contract-checkout-refactor",
    feature: "Checkout Refactor",
    status: "drift_detected",
    description: "Refactor checkout flow to support multi-currency baskets.",
  },
];

export const DEMO_CONTRACT_FULL = {
  id: "contract-currency-cache",
  feature: "currency-cache",
  featureLabel: "Currency Rate Caching",
  description: "Cache currency exchange rates used during checkout.",
  status: "active",
  requirements: [
    "Reuse RedisStore",
    "Use retry/backoff logic",
    "Preserve checkout compatibility",
    "Handle cache failures gracefully",
  ],
  requiredDependencies: [
    "pkg/cache/redis_store",
    "pkg/network/backoff",
  ],
  forbiddenPatterns: [
    "new Redis(",
    "createClient(",
    "new RedisClient(",
    "new IORedis(",
  ],
  architectureRules: [
    {
      id: "ADR-008",
      description: "Use the shared cache abstraction.",
    },
    {
      id: "ADR-012",
      description: "Do not instantiate Redis clients inside services.",
    },
  ],
  expectedInterfaces: [
    {
      name: "getRate",
      signature: "getRate(from: string, to: string): Promise<ExchangeRate>",
      compatibilityRequirement:
        "Existing checkout consumers must remain compatible.",
    },
  ],
  edgeCases: [
    "Cache unavailable",
    "External API timeout",
    "Rate provider failure",
    "Invalid currency",
    "Cache expiration",
  ],
  architectureDiagram: `graph TD
    A[PaymentProcessor] --> B[CurrencyService]
    B --> C[RedisStore]
    C --> D[(Shared Cache)]
    B --> E[withBackoff]
    E --> F[External Rate Provider]
    style C fill:#22c55e,color:#fff
    style E fill:#22c55e,color:#fff`,
};

export const DEMO_PR = {
  number: 142,
  title: "Add Currency Rate Caching",
  body: "Implements caching for currency exchange rates to reduce external API calls during checkout. Adds retry logic for transient failures.",
  filesChanged: 5,
  additions: 182,
  deletions: 34,
  contractId: "contract-currency-cache",
  files: [
    {
      path: "src/services/currency_service.ts",
      status: "modified",
      additions: 89,
      deletions: 12,
    },
    {
      path: "tests/currency_service.test.ts",
      status: "modified",
      additions: 67,
      deletions: 22,
    },
    {
      path: "package.json",
      status: "modified",
      additions: 3,
      deletions: 0,
    },
    {
      path: "package-lock.json",
      status: "modified",
      additions: 23,
      deletions: 0,
    },
  ],
};

export const DEMO_REVIEW_RESULT = {
  prNumber: 142,
  prTitle: "Add Currency Rate Caching",
  intentAlignment: 68,
  summary:
    "The implementation partially satisfies the architectural contract. Caching and retry logic are present, but the implementation bypasses the approved cache abstraction and introduces a breaking interface change in an unmodified downstream consumer.",
  findings: [
    {
      id: "finding-1",
      type: "drift",
      severity: "high",
      title: "Direct Cache Client Instantiation",
      description:
        "CurrencyService creates its own RedisClient instance instead of using the shared RedisStore abstraction from pkg/cache/redis_store.ts.",
      filePath: "src/services/currency_service.ts",
      lineNumber: 17,
      rule: "ADR-012",
      intent: "Reuse: pkg/cache/redis_store.ts",
      actual:
        "CurrencyService creates a separate cache client (class RedisClient { ... })",
      whyItMatters:
        "The implementation duplicates connection ownership and bypasses the approved caching infrastructure. Under load this creates duplicate Redis connection pools, risking resource exhaustion.",
      suggestion:
        "Remove the local RedisClient class. Accept CacheStore via constructor injection and use the shared RedisStore instance from pkg/cache/redis_store.ts.",
    },
    {
      id: "finding-2",
      type: "blast_radius",
      severity: "high",
      title: "Interface Compatibility Break in Unmodified Consumer",
      description:
        "getRate() signature changed from (from: string, to: string) to (from: CurrencyEnum, to: CurrencyEnum). PaymentProcessor was NOT modified but calls getRate(\"USD\", \"PHP\") with string arguments.",
      filePath: "src/services/checkout/payment_processor.ts",
      lineNumber: 29,
      rule: "Expected Interface",
      unmodifiedFile: true,
      intent:
        'Existing checkout consumers must remain compatible. getRate(from: string, to: string)',
      actual:
        'getRate(from: CurrencyEnum, to: CurrencyEnum) — PaymentProcessor still calls getRate("USD", "PHP")',
      whyItMatters:
        "TypeScript will fail to compile. At runtime, string arguments will not match the enum type guard, causing silent failures or TypeScript errors in the checkout flow.",
      suggestion:
        "Either: (a) revert the signature to string-based and use CurrencyEnum internally, or (b) add a backwards-compatible overload, or (c) update PaymentProcessor to use CurrencyEnum.",
    },
  ],
  contractCoverage: {
    total: 4,
    satisfied: 3,
    requirements: [
      { text: "Cache exchange-rate responses", satisfied: true },
      { text: "Use retry/backoff logic", satisfied: true },
      { text: "Handle cache failures gracefully", satisfied: true },
      { text: "Reuse RedisStore", satisfied: false },
    ],
  },
  blastRadius: {
    affectedFiles: [
      {
        path: "src/services/checkout/payment_processor.ts",
        risk: "high",
        reason:
          'Calls getRate("USD", "PHP") — string arguments incompatible with new CurrencyEnum signature.',
        unmodified: true,
        lineRef: "Line 29: this.currencyService.getRate(currency, targetCurrency)",
      },
    ],
    unmodifiedFilesAtRisk: 1,
  },
  verification: {
    results: [
      { name: "Cache hit", status: "pass" },
      { name: "Cache miss (fallthrough)", status: "pass" },
      { name: "Retry behavior", status: "pass" },
      { name: "Cache failure graceful degradation", status: "pass" },
      { name: "Checkout compatibility", status: "fail", reason: "PaymentProcessor.processCheckout fails — getRate type mismatch" },
    ],
  },
  architectureComparison: {
    expectedDiagram: `graph TD
    A[PaymentProcessor] --> B[CurrencyService]
    B --> C[RedisStore]
    C --> D[(Shared Cache)]
    B --> E[withBackoff]
    E --> F[External Rate Provider]
    style C fill:#22c55e,color:#fff
    style E fill:#22c55e,color:#fff`,
    actualDiagram: `graph TD
    A[PaymentProcessor] --> B[CurrencyService]
    B --> C[RedisStore]
    B --> G[Custom RedisClient]
    C --> D[(Shared Cache)]
    G --> H[(Duplicate Cache)]
    B --> E[withBackoff]
    E --> F[External Rate Provider]
    style G fill:#ef4444,color:#fff
    style H fill:#ef4444,color:#fff`,
  },
};
