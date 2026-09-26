import * as fs from "fs";
import * as path from "path";

const DEMO_REPO_ROOT = path.join(process.cwd(), "demo-repo");

export interface RepoFile {
  path: string;
  content: string;
}

export interface AnalysisStep {
  label: string;
  key: string;
  finding?: string;
}

export interface RepoAnalysis {
  steps: AnalysisStep[];
  existingInfrastructure: {
    name: string;
    path: string;
    description: string;
  }[];
  adrs: { id: string; title: string; rule: string }[];
  architectureProposal: {
    diagram: string;
    decisions: {
      title: string;
      chosen: string;
      rejected: string;
      reason: string;
    }[];
  };
}

function readDemoFile(relPath: string): string | null {
  try {
    return fs.readFileSync(path.join(DEMO_REPO_ROOT, relPath), "utf-8");
  } catch {
    return null;
  }
}

function listDemoFiles(dir: string): string[] {
  const full = path.join(DEMO_REPO_ROOT, dir);
  try {
    return fs.readdirSync(full).map((f) => path.join(dir, f));
  } catch {
    return [];
  }
}

export async function analyzeDemoRepository(
  _featureName: string,
  _description: string
): Promise<RepoAnalysis> {
  // Simulate async analysis with delays for visual effect
  const steps: AnalysisStep[] = [
    { label: "Repository structure", key: "structure" },
    { label: "Architecture documentation", key: "docs" },
    { label: "Existing cache infrastructure", key: "cache" },
    { label: "Service dependencies", key: "dependencies" },
    { label: "Tests", key: "tests" },
  ];

  // Read actual demo files
  const redisStore = readDemoFile("pkg/cache/redis_store.ts");
  const backoff = readDemoFile("pkg/network/backoff.ts");
  const adr008 = readDemoFile("docs/adr/ADR-008-cache-abstraction.md");
  const adr012 = readDemoFile("docs/adr/ADR-012-redis-connections.md");

  const existingInfrastructure = [];
  if (redisStore) {
    existingInfrastructure.push({
      name: "RedisStore",
      path: "pkg/cache/redis_store.ts",
      description:
        "Company-approved shared caching abstraction. All services must use this.",
    });
  }
  if (backoff) {
    existingInfrastructure.push({
      name: "Backoff Utility",
      path: "pkg/network/backoff.ts",
      description:
        "Exponential retry/backoff helper for transient external API failures.",
    });
  }

  const adrs = [];
  if (adr008) {
    adrs.push({
      id: "ADR-008",
      title: "Shared Cache Abstraction",
      rule: "Services requiring caching MUST use the shared RedisStore abstraction.",
    });
  }
  if (adr012) {
    adrs.push({
      id: "ADR-012",
      title: "Redis Connection Ownership",
      rule: "Services MUST NOT instantiate Redis clients directly.",
    });
  }

  return {
    steps,
    existingInfrastructure,
    adrs,
    architectureProposal: {
      diagram: `graph TD
    A[PaymentProcessor] --> B[CurrencyService]
    B --> C[RedisStore]
    C --> D[(Shared Cache)]
    B --> E[withBackoff]
    E --> F[External Rate Provider]
    style C fill:#22c55e,color:#fff
    style E fill:#22c55e,color:#fff`,
      decisions: [
        {
          title: "Cache Abstraction",
          chosen: "Reuse RedisStore (pkg/cache/redis_store.ts)",
          rejected: "Create Redis client directly inside CurrencyService",
          reason:
            "Violates ADR-012 and duplicates connection ownership.",
        },
        {
          title: "Retry Strategy",
          chosen: "Use withBackoff() (pkg/network/backoff.ts)",
          rejected: "Implement custom retry loop inside CurrencyService",
          reason:
            "The company-approved backoff utility already handles jitter, max attempts, and delays.",
        },
      ],
    },
  };
}

export function generateContract(
  featureName: string,
  description: string,
  analysis: RepoAnalysis
) {
  const slug = featureName.toLowerCase().replace(/\s+/g, "-");
  return {
    feature: slug,
    featureLabel: featureName,
    description,
    requirements: [
      "Reuse RedisStore",
      "Use retry/backoff logic",
      "Preserve checkout compatibility",
      "Handle cache failures gracefully",
    ],
    requiredDependencies: analysis.existingInfrastructure.map((i) =>
      i.path.replace(".ts", "")
    ),
    forbiddenPatterns: [
      "new Redis(",
      "createClient(",
      "new RedisClient(",
      "new IORedis(",
    ],
    architectureRules: analysis.adrs.map((a) => ({
      id: a.id,
      description: a.rule,
    })),
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
    architectureDiagram: analysis.architectureProposal.diagram,
  };
}
