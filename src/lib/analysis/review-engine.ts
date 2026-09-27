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

// ---------------------------------------------------------------------------
// LLM call helper
// ---------------------------------------------------------------------------

/**
 * Calls the configured LLM API and returns the parsed JSON from the response.
 * Supports IBM watsonx.ai (WATSONX_API_KEY + WATSONX_PROJECT_ID) and
 * OpenAI-compatible endpoints (OPENAI_API_KEY, optional OPENAI_BASE_URL).
 */
async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const watsonxKey = process.env.WATSONX_API_KEY;
  const watsonxProject = process.env.WATSONX_PROJECT_ID;
  const watsonxUrl = process.env.WATSONX_URL ?? "https://us-south.ml.cloud.ibm.com";

  const openaiKey = process.env.OPENAI_API_KEY;
  const openaiBaseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const openaiModel = process.env.OPENAI_MODEL ?? "gpt-4o";

  if (watsonxKey && watsonxProject) {
    return callWatsonx(systemPrompt, userPrompt, watsonxKey, watsonxProject, watsonxUrl);
  }

  if (openaiKey) {
    return callOpenAICompatible(systemPrompt, userPrompt, openaiKey, openaiBaseUrl, openaiModel);
  }

  throw new Error(
    "No AI provider configured. Set WATSONX_API_KEY + WATSONX_PROJECT_ID, or OPENAI_API_KEY in your environment."
  );
}

async function callWatsonx(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  projectId: string,
  baseUrl: string
): Promise<string> {
  // Get IAM token
  const iamRes = await fetch("https://iam.cloud.ibm.com/identity/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${encodeURIComponent(apiKey)}`,
  });
  if (!iamRes.ok) {
    throw new Error(`IBM IAM token error: ${await iamRes.text()}`);
  }
  const iamData = await iamRes.json() as { access_token: string };

  const model = process.env.WATSONX_MODEL ?? "meta-llama/llama-3-3-70b-instruct";

  const body = {
    model_id: model,
    project_id: projectId,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    parameters: {
      max_new_tokens: 4000,
      temperature: 0,
    },
  };

  const res = await fetch(
    `${baseUrl}/ml/v1/text/chat?version=2024-05-01`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${iamData.access_token}`,
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    throw new Error(`Watsonx API error: ${await res.text()}`);
  }
  const data = await res.json() as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content;
}

async function callOpenAICompatible(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  baseUrl: string,
  model: string
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI API error: ${await res.text()}`);
  }
  const data = await res.json() as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content;
}

/** Strip markdown code fences and parse JSON from an LLM response. */
function parseJsonFromLLMResponse<T>(raw: string): T {
  const stripped = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(stripped) as T;
}

// ---------------------------------------------------------------------------
// Intent Auditor
// ---------------------------------------------------------------------------

/**
 * Intent Auditor — compares the PR diff against the architectural contract
 * using an LLM and returns findings + contract coverage + alignment score.
 */
export async function runIntentAudit(
  contractJson: string,
  prDiff: string
): Promise<{
  findings: Finding[];
  contractCoverage: ContractCoverage;
  alignment: number;
  summary: string;
}> {
  const systemPrompt = `You are an expert software architect reviewing a pull request for intent drift.
You will be given an architectural contract (JSON) and a PR diff.
Your job is to identify where the implementation deviates from the contract's stated intent, requirements, forbidden patterns, and architecture rules.
Respond with valid JSON only — no markdown, no explanation outside the JSON.`;

  const userPrompt = `## Architectural Contract
${contractJson}

## PR Diff
${prDiff.slice(0, 12000)}

## Instructions
Analyze the diff against the contract and respond with this exact JSON structure:
{
  "intentAlignment": <integer 0-100>,
  "summary": "<one paragraph summary of how well the PR aligns with the contract>",
  "contractCoverage": {
    "total": <number of requirements>,
    "satisfied": <number satisfied>,
    "requirements": [
      { "text": "<requirement text>", "satisfied": <true|false> }
    ]
  },
  "findings": [
    {
      "id": "finding-1",
      "type": "drift",
      "severity": "high|medium|low|info",
      "title": "<short title>",
      "description": "<detailed description>",
      "filePath": "<file path if applicable>",
      "lineNumber": <line number or null>,
      "rule": "<architecture rule id if applicable>",
      "intent": "<what the contract specifies>",
      "actual": "<what the PR implements>",
      "whyItMatters": "<business/technical impact>",
      "suggestion": "<concrete fix suggestion>"
    }
  ]
}

For the contractCoverage requirements array, use the exact requirement texts from the contract's "requirements" field.
Only include findings where there is a real, concrete issue. If there are no issues, return an empty findings array.
Severity guide: high = breaks functionality or violates a hard rule, medium = notable deviation, low = minor concern, info = observation.`;

  const raw = await callLLM(systemPrompt, userPrompt);
  const parsed = parseJsonFromLLMResponse<{
    intentAlignment: number;
    summary: string;
    contractCoverage: ContractCoverage;
    findings: Finding[];
  }>(raw);

  return {
    findings: parsed.findings ?? [],
    contractCoverage: parsed.contractCoverage,
    alignment: parsed.intentAlignment,
    summary: parsed.summary ?? "Review complete.",
  };
}

// ---------------------------------------------------------------------------
// Blast Radius Analyzer
// ---------------------------------------------------------------------------

/**
 * Blast Radius Analyzer — identifies unmodified files that may be affected
 * by the changes in this PR using the LLM.
 */
export async function runBlastRadiusAnalysis(
  prFiles: string[],
  contractJson: string
): Promise<BlastRadiusResult> {
  const systemPrompt = `You are a software architect performing a blast radius analysis for a pull request.
Given the list of files changed in the PR and the architectural contract, identify which OTHER files (not in the PR) may be broken or need to be updated.
Focus on interface changes, signature changes, renamed exports, or broken consumers.
Respond with valid JSON only.`;

  const userPrompt = `## Architectural Contract
${contractJson}

## Files Modified in PR
${prFiles.join("\n")}

## Instructions
Identify files that are NOT in the PR but could be broken by these changes.
Use the contract's expectedInterfaces and the list of changed files to reason about consumers.
Respond with this exact JSON structure:
{
  "affectedFiles": [
    {
      "path": "<file path>",
      "risk": "high|medium|low",
      "reason": "<why this file is at risk>",
      "unmodified": true,
      "lineRef": "<specific line reference if known, otherwise null>"
    }
  ],
  "unmodifiedFilesAtRisk": <count>
}

If no files are at risk, return { "affectedFiles": [], "unmodifiedFilesAtRisk": 0 }.`;

  const raw = await callLLM(systemPrompt, userPrompt);
  const parsed = parseJsonFromLLMResponse<BlastRadiusResult>(raw);

  return {
    affectedFiles: (parsed.affectedFiles ?? []).map((f) => ({
      ...f,
      risk: f.risk as "high" | "medium" | "low",
    })),
    unmodifiedFilesAtRisk: parsed.unmodifiedFilesAtRisk ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Verification Analyzer
// ---------------------------------------------------------------------------

/**
 * Verification Analyzer — generates and evaluates verification checks
 * based on the contract edge cases and PR diff.
 */
export async function runVerification(
  contractJson: string,
  prDiff: string
): Promise<VerificationResult> {
  const systemPrompt = `You are a software quality engineer reviewing a pull request.
Given the architectural contract and PR diff, evaluate whether the contract's edge cases and requirements appear to be handled correctly.
Respond with valid JSON only.`;

  const userPrompt = `## Architectural Contract
${contractJson}

## PR Diff
${prDiff.slice(0, 8000)}

## Instructions
For each edge case listed in the contract (edgeCases field) and each requirement (requirements field), 
evaluate whether the PR diff addresses it correctly.
Respond with this exact JSON structure:
{
  "results": [
    {
      "name": "<check name>",
      "status": "pass|fail|skip",
      "reason": "<reason if fail or skip, null if pass>"
    }
  ]
}

Status guide:
- pass: the diff clearly handles this case
- fail: the diff is missing or incorrectly handles this case
- skip: cannot determine from the diff alone`;

  const raw = await callLLM(systemPrompt, userPrompt);
  const parsed = parseJsonFromLLMResponse<VerificationResult>(raw);

  return {
    results: (parsed.results ?? []).map((v) => ({
      ...v,
      status: v.status as "pass" | "fail" | "skip",
    })),
  };
}

// ---------------------------------------------------------------------------
// Architecture Comparison
// ---------------------------------------------------------------------------

/**
 * Architecture Comparison — builds expected diagram from contract and derives
 * the actual diagram from the PR diff using an LLM.
 */
export async function buildArchitectureComparison(
  contractJson: string,
  prDiff: string
): Promise<ArchitectureComparison> {
  let contractParsed: { architectureDiagram?: string } = {};
  try {
    contractParsed = JSON.parse(contractJson);
  } catch {
    // ignore parse errors
  }

  const expectedDiagram = contractParsed.architectureDiagram ?? "No architecture diagram in contract.";

  const systemPrompt = `You are a software architect. Given a PR diff, produce a Mermaid graph TD diagram that reflects the actual architecture as implemented.
Respond with valid JSON only.`;

  const userPrompt = `## PR Diff
${prDiff.slice(0, 8000)}

## Expected Architecture Diagram (from contract)
${expectedDiagram}

## Instructions
Based on the PR diff, generate a Mermaid diagram showing what was ACTUALLY implemented.
If the diff deviates from the expected diagram, highlight the differences using red-colored nodes.
Respond with this exact JSON structure:
{
  "actualDiagram": "<mermaid graph TD diagram as a single string>"
}`;

  try {
    const raw = await callLLM(systemPrompt, userPrompt);
    const parsed = parseJsonFromLLMResponse<{ actualDiagram: string }>(raw);
    return {
      expectedDiagram,
      actualDiagram: parsed.actualDiagram ?? expectedDiagram,
    };
  } catch {
    // If architecture diagram generation fails, return expected as actual
    return {
      expectedDiagram,
      actualDiagram: expectedDiagram,
    };
  }
}

// ---------------------------------------------------------------------------
// Full review pipeline
// ---------------------------------------------------------------------------

/**
 * Full review pipeline — runs all analyzers against real PR data and contract.
 */
export async function runFullReview(
  contractJson: string,
  prDiff: string,
  prFiles: string[]
): Promise<ReviewResult> {
  const [audit, blast, verification, archComparison] = await Promise.all([
    runIntentAudit(contractJson, prDiff),
    runBlastRadiusAnalysis(prFiles, contractJson),
    runVerification(contractJson, prDiff),
    buildArchitectureComparison(contractJson, prDiff),
  ]);

  return {
    prNumber: 0, // patched by the API route with the real PR number
    prTitle: "",  // patched by the API route with the real PR title
    intentAlignment: audit.alignment,
    summary: audit.summary,
    findings: [
      ...audit.findings,
      // Promote blast radius affected files as findings
      ...blast.affectedFiles.map((f, i) => ({
        id: `blast-${i + 1}`,
        type: "blast_radius" as const,
        severity: f.risk,
        title: `Unmodified file at risk: ${f.path}`,
        description: f.reason,
        filePath: f.path,
        unmodifiedFile: f.unmodified,
        whyItMatters: f.reason,
        suggestion: `Review and update ${f.path} to be compatible with changes in this PR.`,
      })),
    ],
    contractCoverage: audit.contractCoverage,
    blastRadius: blast,
    verification,
    architectureComparison: archComparison,
  };
}
