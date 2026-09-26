"use client";

import { useState } from "react";
import Link from "next/link";
import { DEMO_REVIEW_RESULT, DEMO_CONTRACT_FULL } from "@/lib/demo/data";

type ReviewPhase = "loading" | "ready";

export default function ReviewPage() {
  const [phase, setPhase] = useState<ReviewPhase>("loading");
  const [loadStep, setLoadStep] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "blast" | "verification" | "architecture">("overview");
  const [showFix, setShowFix] = useState<string | null>(null);
  const [dossierExported, setDossierExported] = useState(false);

  const review = DEMO_REVIEW_RESULT;
  const driftFindings = review.findings.filter((f) => f.type === "drift");
  const blastFindings = review.findings.filter((f) => f.type === "blast_radius");

  const LOAD_STEPS = [
    "Loading architectural contract...",
    "Running Intent Auditor...",
    "Running Blast Radius Analyzer...",
    "Running Verification...",
    "Assembling review dossier...",
  ];

  async function startReview() {
    setPhase("loading");
    for (let i = 0; i < LOAD_STEPS.length; i++) {
      setLoadStep(i);
      await new Promise((r) => setTimeout(r, 700));
    }
    setPhase("ready");
  }

  async function exportDossier() {
    const res = await fetch("/api/demo/export-dossier", { method: "POST" });
    if (res.ok) setDossierExported(true);
  }

  // Auto-start on mount
  if (phase === "loading" && loadStep === 0) {
    setTimeout(startReview, 100);
  }

  const alignmentColor =
    review.intentAlignment >= 80
      ? "text-[#3fb950]"
      : review.intentAlignment >= 60
      ? "text-[#d29922]"
      : "text-[#f85149]";

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Nav */}
      <nav className="border-b border-[#30363d] bg-[#161b22] px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3 text-sm">
            <Link href="/demo/repositories/demo-ecommerce" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">IL</span>
              </div>
              <span className="font-semibold text-[#e6edf3]">IntentLoop</span>
            </Link>
            <span className="text-[#30363d]">/</span>
            <Link href="/demo/repositories/demo-ecommerce/pull-requests" className="text-[#8b949e] hover:text-[#58a6ff]">
              Pull Requests
            </Link>
            <span className="text-[#30363d]">/</span>
            <span className="text-[#e6edf3]">#142 Review</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-900/50 text-yellow-400 border border-yellow-800/50">DEMO</span>
        </div>
      </nav>

      {/* Loading */}
      {phase === "loading" && (
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 rounded-full border-2 border-[#58a6ff] border-t-transparent animate-spin mx-auto mb-6" />
            <h2 className="text-lg font-semibold text-[#e6edf3] mb-6">Bob is analyzing...</h2>
            <div className="space-y-2 text-left">
              {LOAD_STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  {i < loadStep ? (
                    <span className="text-[#3fb950] font-mono text-sm">✓</span>
                  ) : i === loadStep ? (
                    <span className="text-[#58a6ff] font-mono text-sm animate-pulse">→</span>
                  ) : (
                    <span className="text-[#30363d] font-mono text-sm">○</span>
                  )}
                  <span className={i <= loadStep ? "text-[#e6edf3] text-sm" : "text-[#8b949e] text-sm"}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Ready */}
      {phase === "ready" && (
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* PR Header */}
          <div className="mb-6">
            <div className="text-sm text-[#8b949e] mb-1">PR #142</div>
            <h1 className="text-2xl font-bold text-[#e6edf3]">{review.prTitle}</h1>
          </div>

          {/* Score cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-lg border border-[#30363d] bg-[#161b22]">
              <div className="text-xs text-[#8b949e] uppercase tracking-wider mb-1">Intent Alignment</div>
              <div className={`text-3xl font-bold font-mono ${alignmentColor}`}>{review.intentAlignment}%</div>
            </div>
            <div className="p-4 rounded-lg border border-[#30363d] bg-[#161b22]">
              <div className="text-xs text-[#8b949e] uppercase tracking-wider mb-1">Findings</div>
              <div className="text-3xl font-bold font-mono text-[#d29922]">{review.findings.length}</div>
            </div>
            <div className="p-4 rounded-lg border border-red-900/50 bg-red-900/10">
              <div className="text-xs text-[#8b949e] uppercase tracking-wider mb-1">High Risk</div>
              <div className="text-3xl font-bold font-mono text-[#f85149]">
                {review.findings.filter((f) => f.severity === "high").length}
              </div>
            </div>
            <div className="p-4 rounded-lg border border-[#30363d] bg-[#161b22]">
              <div className="text-xs text-[#8b949e] uppercase tracking-wider mb-1">Unmodified at Risk</div>
              <div className="text-3xl font-bold font-mono text-[#d29922]">{review.blastRadius.unmodifiedFilesAtRisk}</div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 rounded-lg border border-[#30363d] bg-[#161b22] mb-6">
            <p className="text-sm text-[#8b949e]">{review.summary}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-[#30363d]">
            {(["overview", "blast", "verification", "architecture"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-[#58a6ff] text-[#e6edf3]"
                    : "border-transparent text-[#8b949e] hover:text-[#e6edf3]"
                }`}
              >
                {tab === "overview" && "Intent vs Reality"}
                {tab === "blast" && "Blast Radius"}
                {tab === "verification" && "Verification"}
                {tab === "architecture" && "Architecture"}
              </button>
            ))}
          </div>

          {/* Tab: Intent vs Reality */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Contract Coverage */}
              <div className="p-5 rounded-lg border border-[#30363d] bg-[#161b22]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-[#8b949e] uppercase tracking-wider">Contract Coverage</h2>
                  <span className="font-mono text-sm text-[#d29922]">
                    {review.contractCoverage.satisfied} / {review.contractCoverage.total} Requirements Satisfied
                  </span>
                </div>
                <ul className="space-y-2">
                  {review.contractCoverage.requirements.map((r) => (
                    <li key={r.text} className="flex items-center gap-2 text-sm">
                      <span className={r.satisfied ? "text-[#3fb950]" : "text-[#f85149]"}>
                        {r.satisfied ? "✓" : "✗"}
                      </span>
                      <span className={r.satisfied ? "text-[#e6edf3]" : "text-[#f85149]"}>{r.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Drift Findings */}
              {driftFindings.map((finding) => (
                <div
                  key={finding.id}
                  className="rounded-lg border border-red-800/50 bg-red-900/10 overflow-hidden"
                >
                  <div className="px-5 py-3 bg-red-900/20 border-b border-red-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[#f85149] font-bold">✗</span>
                      <span className="text-[#f85149] font-semibold text-sm uppercase tracking-wide">INTENT DRIFT</span>
                    </div>
                    <span className="text-xs font-mono text-red-400 px-2 py-0.5 rounded border border-red-800/50 bg-red-900/30">
                      {finding.severity.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    <h3 className="font-semibold text-[#e6edf3]">{finding.title}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 rounded bg-green-900/10 border border-green-800/30">
                        <div className="text-xs text-[#3fb950] font-semibold mb-1">DESIGN INTENT</div>
                        <div className="text-sm text-[#e6edf3] font-mono">{finding.intent}</div>
                      </div>
                      <div className="p-3 rounded bg-red-900/10 border border-red-800/30">
                        <div className="text-xs text-[#f85149] font-semibold mb-1">ACTUAL IMPLEMENTATION</div>
                        <div className="text-sm text-[#e6edf3] font-mono">{finding.actual}</div>
                      </div>
                    </div>

                    {finding.rule && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#a371f7] px-2 py-0.5 rounded border border-purple-800/50 bg-purple-900/20">
                          {finding.rule}
                        </span>
                        <span className="text-sm text-[#8b949e]">Architecture Rule</span>
                      </div>
                    )}

                    {finding.filePath && (
                      <div className="flex items-center gap-2 text-sm font-mono text-[#8b949e]">
                        <span className="text-[#58a6ff]">{finding.filePath}</span>
                        {finding.lineNumber && <span>line {finding.lineNumber}</span>}
                      </div>
                    )}

                    <div className="p-3 rounded bg-[#0d1117] border border-[#30363d]">
                      <div className="text-xs text-[#8b949e] font-semibold mb-1">WHY THIS MATTERS</div>
                      <div className="text-sm text-[#e6edf3]">{finding.whyItMatters}</div>
                    </div>

                    <button
                      onClick={() => setShowFix(showFix === finding.id ? null : finding.id)}
                      className="text-sm text-[#58a6ff] hover:text-[#79c0ff] flex items-center gap-1"
                    >
                      {showFix === finding.id ? "▼" : "▶"} Show Suggested Fix
                    </button>
                    {showFix === finding.id && (
                      <div className="p-3 rounded bg-[#0d1117] border border-[#58a6ff]/30">
                        <div className="text-xs text-[#58a6ff] font-semibold mb-1">SUGGESTED FIX</div>
                        <div className="text-sm text-[#e6edf3]">{finding.suggestion}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Blast Radius */}
          {activeTab === "blast" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-[#d29922]/40 bg-yellow-900/10">
                <p className="text-sm text-[#d29922]">
                  <strong>{review.blastRadius.unmodifiedFilesAtRisk}</strong> unmodified file(s) may be affected by changes in this PR.
                  Bob scanned callers, consumers, imports, interfaces, and downstream services.
                </p>
              </div>

              {review.blastRadius.affectedFiles.map((file) => (
                <div
                  key={file.path}
                  className="rounded-lg border border-yellow-800/40 bg-yellow-900/5 overflow-hidden"
                >
                  <div className="px-5 py-3 bg-yellow-900/20 border-b border-yellow-800/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[#d29922] font-bold">⚠</span>
                      <span className="text-[#d29922] font-semibold text-sm uppercase tracking-wide">
                        {file.risk.toUpperCase()} RISK CONSUMER
                      </span>
                    </div>
                    {file.unmodified && (
                      <span className="text-xs font-mono font-bold text-[#d29922] px-2 py-0.5 rounded border border-yellow-800/50 bg-yellow-900/30">
                        UNMODIFIED FILE
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="font-mono text-sm text-[#58a6ff]">{file.path}</div>

                    {file.unmodified && (
                      <div className="p-3 rounded bg-yellow-900/10 border border-yellow-800/30">
                        <p className="text-sm text-[#d29922] font-semibold">
                          This file was NOT modified in the Pull Request.
                        </p>
                        <p className="text-sm text-[#8b949e] mt-1">
                          However, a change in the PR affects an interface this file depends on.
                        </p>
                      </div>
                    )}

                    <div className="p-3 rounded bg-[#0d1117] border border-[#30363d]">
                      <div className="text-xs text-[#8b949e] mb-1">COMPATIBILITY ISSUE</div>
                      <div className="text-sm text-[#e6edf3]">{file.reason}</div>
                    </div>

                    {file.lineRef && (
                      <div className="font-mono text-sm text-[#8b949e]">
                        Reference: <span className="text-[#e6edf3]">{file.lineRef}</span>
                      </div>
                    )}

                    {/* Specific blast details for PaymentProcessor */}
                    {file.path.includes("payment_processor") && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded bg-green-900/10 border border-green-800/30">
                            <div className="text-xs text-[#3fb950] font-semibold mb-1">ORIGINAL SIGNATURE</div>
                            <div className="font-mono text-sm text-[#e6edf3]">getRate(from: string, to: string)</div>
                          </div>
                          <div className="p-3 rounded bg-red-900/10 border border-red-800/30">
                            <div className="text-xs text-[#f85149] font-semibold mb-1">NEW SIGNATURE</div>
                            <div className="font-mono text-sm text-[#f85149]">getRate(from: CurrencyEnum, to: CurrencyEnum)</div>
                          </div>
                        </div>
                        <div className="p-3 rounded bg-[#0d1117] border border-[#30363d]">
                          <div className="text-xs text-[#8b949e] mb-1">CONSUMER STILL CALLS</div>
                          <div className="font-mono text-sm text-[#d29922]">getRate(&quot;USD&quot;, &quot;PHP&quot;)</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Verification */}
          {activeTab === "verification" && (
            <div className="space-y-4">
              <div className="p-5 rounded-lg border border-[#30363d] bg-[#161b22]">
                <h2 className="text-sm font-semibold text-[#8b949e] uppercase tracking-wider mb-4">Verification Results</h2>
                <ul className="space-y-3">
                  {review.verification.results.map((v) => (
                    <li key={v.name} className="flex items-start gap-3">
                      <span className={
                        v.status === "pass" ? "text-[#3fb950]" :
                        v.status === "fail" ? "text-[#f85149]" : "text-[#8b949e]"
                      }>
                        {v.status === "pass" ? "✓" : v.status === "fail" ? "✗" : "○"}
                      </span>
                      <div>
                        <span className={
                          v.status === "pass" ? "text-[#e6edf3]" :
                          v.status === "fail" ? "text-[#f85149]" : "text-[#8b949e]"
                        }>{v.name}</span>
                        {v.reason && (
                          <p className="text-xs text-[#8b949e] mt-0.5 font-mono">{v.reason}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Remediation */}
              <div className="p-5 rounded-lg border border-[#30363d] bg-[#161b22]">
                <h2 className="text-sm font-semibold text-[#8b949e] uppercase tracking-wider mb-4">Compatibility Fix</h2>
                <div className="space-y-3 text-sm text-[#e6edf3]">
                  <p>Either:</p>
                  <div className="p-3 rounded bg-[#0d1117] border border-[#30363d] font-mono text-xs">
                    <span className="text-[#58a6ff]">Option A:</span> Update PaymentProcessor to use CurrencyEnum
                  </div>
                  <p className="text-[#8b949e]">or</p>
                  <div className="p-3 rounded bg-[#0d1117] border border-[#30363d] font-mono text-xs">
                    <span className="text-[#58a6ff]">Option B:</span> Preserve a backwards-compatible getRate(string, string) interface in CurrencyService
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Architecture */}
          {activeTab === "architecture" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-lg border border-green-800/40 bg-green-900/5">
                  <h3 className="text-xs font-semibold text-[#3fb950] uppercase tracking-wider mb-4">Expected (Contract)</h3>
                  <div className="font-mono text-sm space-y-1">
                    <div className="text-[#8b949e]">CurrencyService</div>
                    <div className="pl-6 text-[#8b949e]">↓</div>
                    <div className="text-[#3fb950]">RedisStore</div>
                    <div className="pl-10 text-[#8b949e]">↓</div>
                    <div className="pl-10 text-[#3fb950]">Shared Cache</div>
                  </div>
                </div>

                <div className="p-5 rounded-lg border border-red-800/40 bg-red-900/5">
                  <h3 className="text-xs font-semibold text-[#f85149] uppercase tracking-wider mb-4">Actual (PR Implementation)</h3>
                  <div className="font-mono text-sm space-y-1">
                    <div className="text-[#8b949e]">CurrencyService</div>
                    <div className="pl-6 text-[#8b949e]">├──→ RedisStore</div>
                    <div className="pl-10 text-[#8b949e]">│</div>
                    <div className="pl-6 text-[#f85149]">└──→ Custom RedisClient ← VIOLATION</div>
                    <div className="pl-14 text-[#8b949e]">↓</div>
                    <div className="pl-14 text-[#f85149]">Duplicate Cache</div>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="p-5 rounded-lg border border-[#30363d] bg-[#161b22]">
                <h3 className="text-sm font-semibold text-[#8b949e] mb-3">What changed</h3>
                <p className="text-sm text-[#e6edf3]">
                  The architectural contract specified that <span className="font-mono text-[#3fb950]">CurrencyService</span> should
                  use the shared <span className="font-mono text-[#3fb950]">RedisStore</span> abstraction.
                  The implementation introduces a parallel <span className="font-mono text-[#f85149]">RedisClient</span> class
                  inside the service itself — creating a duplicate connection pool and violating ADR-012.
                </p>
              </div>
            </div>
          )}

          {/* Actions bar */}
          <div className="mt-8 pt-6 border-t border-[#30363d] flex flex-wrap gap-3 items-center">
            <button
              onClick={exportDossier}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#30363d] text-[#e6edf3] hover:border-[#58a6ff] text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Dossier
            </button>
            {dossierExported && (
              <span className="text-xs text-[#3fb950]">✓ Saved to .bob/reviews/currency-cache-review.md</span>
            )}
            <Link
              href="/demo/repositories/demo-ecommerce/contracts/currency-cache"
              className="px-4 py-2 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] text-sm transition-colors"
            >
              View Contract
            </Link>
            <Link
              href="/demo/repositories/demo-ecommerce/pull-requests"
              className="px-4 py-2 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] text-sm transition-colors"
            >
              Back to PRs
            </Link>
          </div>

          {/* Closer tagline */}
          <div className="mt-10 pt-6 border-t border-[#30363d] text-center">
            <p className="text-[#8b949e] text-sm">
              <strong className="text-[#e6edf3]">Bob IntentLoop</strong> — From design intent to verified implementation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
