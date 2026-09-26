import { DEMO_REVIEW_RESULT } from "@/lib/demo/data";

export interface ReviewResult {
  prNumber: number;
  prTitle: string;
  intentAlignment: number;
  summary: string;
  findings: Finding[];
  contractCoverage: ContractCoverage;
  blastRadius: BlastRadiusResult;
  verification: VerificationResult;
  architectureComparison: ArchitectureComparison;
}

export interface Finding {
  id: string;
  type: "drift" | "blast_radius" | "verification" | "compliance";
  severity: "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  filePath?: string;
  lineNumber?: number;
  rule?: string;
  intent?: string;
  actual?: string;
  unmodifiedFile?: boolean;
  whyItMatters?: string;
  suggestion?: string;
  reason?: string;
}

export interface ContractCoverage {
  total: number;
  satisfied: number;
  requirements: { text: string; satisfied: boolean }[];
}

export interface BlastRadiusResult {
  affectedFiles: {
    path: string;
    risk: "high" | "medium" | "low";
    reason: string;
    unmodified: boolean;
    lineRef?: string;
  }[];
  unmodifiedFilesAtRisk: number;
}

export interface VerificationResult {
  results: {
    name: string;
    status: "pass" | "fail" | "skip";
    reason?: string;
  }[];
}

export interface ArchitectureComparison {
  expectedDiagram: string;
  actualDiagram: string;
}

/**
 * Intent Auditor — compares implementation against the architectural contract.
 * For the demo, returns pre-computed results from demo data.
 */
export async function runIntentAudit(
  contractJson: string,
  _prDiff: string
): Promise<{
  findings: Finding[];
  contractCoverage: ContractCoverage;
  alignment: number;
}> {
  // In production: send contractJson + prDiff to LLM for analysis.
  // For demo: return pre-computed findings.
  const result = DEMO_REVIEW_RESULT;
  return {
    findings: result.findings as Finding[],
    contractCoverage: result.contractCoverage,
    alignment: result.intentAlignment,
  };
}

/**
 * Blast Radius Analyzer — identifies unmodified files that may be affected.
 */
export async function runBlastRadiusAnalysis(
  _prFiles: string[],
  _contractJson: string
): Promise<BlastRadiusResult> {
  const r = DEMO_REVIEW_RESULT.blastRadius;
  return {
    affectedFiles: r.affectedFiles.map((f) => ({
      ...f,
      risk: f.risk as "high" | "medium" | "low",
    })),
    unmodifiedFilesAtRisk: r.unmodifiedFilesAtRisk,
  };
}

/**
 * Verification Analyzer — generates and runs tests based on contract + PR.
 */
export async function runVerification(
  _contractJson: string,
  _prDiff: string
): Promise<VerificationResult> {
  const r = DEMO_REVIEW_RESULT.verification;
  return {
    results: r.results.map((v) => ({
      ...v,
      status: v.status as "pass" | "fail" | "skip",
    })),
  };
}

/**
 * Architecture Comparison — builds expected vs actual diagrams.
 */
export function buildArchitectureComparison(
  contractJson: string
): ArchitectureComparison {
  return DEMO_REVIEW_RESULT.architectureComparison;
}

/**
 * Full review pipeline — runs all three analyzers and assembles the result.
 */
export async function runFullReview(
  contractJson: string,
  prDiff: string,
  prFiles: string[]
): Promise<ReviewResult> {
  const [audit, blast, verification] = await Promise.all([
    runIntentAudit(contractJson, prDiff),
    runBlastRadiusAnalysis(prFiles, contractJson),
    runVerification(contractJson, prDiff),
  ]);

  const result = DEMO_REVIEW_RESULT;

  return {
    prNumber: result.prNumber,
    prTitle: result.prTitle,
    intentAlignment: audit.alignment,
    summary: result.summary,
    findings: audit.findings,
    contractCoverage: audit.contractCoverage,
    blastRadius: blast,
    verification,
    architectureComparison: buildArchitectureComparison(contractJson),
  };
}
