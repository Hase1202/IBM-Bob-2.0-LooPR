"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ANALYSIS_STEPS = [
  { key: "structure", label: "Repository structure" },
  { key: "docs", label: "Architecture documentation" },
  { key: "cache", label: "Existing cache infrastructure" },
  { key: "dependencies", label: "Service dependencies" },
  { key: "tests", label: "Tests" },
];

const EXISTING_INFRA = [
  { name: "RedisStore", path: "pkg/cache/redis_store.ts", desc: "Company-approved shared caching abstraction", adr: "ADR-008" },
  { name: "Backoff Utility", path: "pkg/network/backoff.ts", desc: "Exponential retry/backoff for external APIs", adr: null },
  { name: "ADR-008", path: "docs/adr/ADR-008-cache-abstraction.md", desc: "Shared cache abstraction required", adr: null },
  { name: "ADR-012", path: "docs/adr/ADR-012-redis-connections.md", desc: "Direct Redis clients prohibited", adr: null },
];

const ARCHITECTURE_DIAGRAM = `graph TD
    A[PaymentProcessor] --> B[CurrencyService]
    B --> C[RedisStore]
    C --> D[(Shared Cache)]
    B --> E[withBackoff]
    E --> F[External Rate Provider]`;

const DECISIONS = [
  {
    title: "Cache Abstraction",
    chosen: "Reuse RedisStore (pkg/cache/redis_store.ts)",
    rejected: "Create Redis client directly inside CurrencyService",
    reason: "Violates ADR-012 and duplicates connection ownership.",
  },
  {
    title: "Retry Strategy",
    chosen: "Use withBackoff() (pkg/network/backoff.ts)",
    rejected: "Implement custom retry loop",
    reason: "The company-approved backoff utility already handles jitter, max attempts, and delays.",
  },
];

type Phase = "input" | "analyzing" | "proposal" | "contract-created";

export default function PlanPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("input");
  const [featureName, setFeatureName] = useState("Currency Rate Caching");
  const [description, setDescription] = useState(
    "Add caching to currency exchange rates so repeated checkout calculations don't repeatedly call the external provider."
  );
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  async function startAnalysis() {
    setPhase("analyzing");
    setCompletedSteps([]);
    for (const step of ANALYSIS_STEPS) {
      await new Promise((r) => setTimeout(r, 600));
      setCompletedSteps((prev) => [...prev, step.key]);
    }
    await new Promise((r) => setTimeout(r, 400));
    setPhase("proposal");
  }

  async function approveContract() {
    setPhase("contract-created");
    // Save contract via API
    await fetch("/api/demo/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featureName, description }),
    }).catch(() => {});
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Nav */}
      <nav className="border-b border-[#30363d] bg-[#161b22] px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/demo/repositories/demo-ecommerce" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7 C2 4.2 4.2 2 7 2 C9.8 2 12 4.2 12 7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 7 C12 9.8 9.8 12 7 12" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round"/><circle cx="7" cy="12" r="1.2" fill="white"/><path d="M10.5 5.5 L12 7 L13.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span className="font-semibold text-[#e6edf3] text-sm">LooPR</span>
            </Link>
            <span className="text-[#30363d]">/</span>
            <span className="text-sm text-[#8b949e]">ecommerce-platform</span>
            <span className="text-[#30363d]">/</span>
            <span className="text-sm text-[#e6edf3]">Plan Feature</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-900/50 text-yellow-400 border border-yellow-800/50">DEMO</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Phase: Input */}
        {phase === "input" && (
          <div>
            <h1 className="text-2xl font-bold text-[#e6edf3] mb-2">Plan New Feature</h1>
            <p className="text-[#8b949e] mb-8">LooPR will analyze the repository and propose an architecture before you build.</p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#e6edf3] mb-1.5">Feature Name</label>
                <input
                  className="w-full px-3 py-2.5 rounded-lg bg-[#161b22] border border-[#30363d] text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] transition-colors"
                  value={featureName}
                  onChange={(e) => setFeatureName(e.target.value)}
                  placeholder="e.g. Currency Rate Caching"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#e6edf3] mb-1.5">What are you building?</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#161b22] border border-[#30363d] text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] transition-colors resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you want to build..."
                />
              </div>
              <button
                onClick={startAnalysis}
                disabled={!featureName.trim()}
                className="w-full py-3 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze Repository with LooPR
              </button>
            </div>
          </div>
        )}

        {/* Phase: Analyzing */}
        {phase === "analyzing" && (
          <div>
            <h1 className="text-2xl font-bold text-[#e6edf3] mb-2">Analyzing repository...</h1>
            <p className="text-[#8b949e] mb-8">LooPR is examining the codebase for existing patterns and constraints.</p>

            <div className="p-6 rounded-lg border border-[#30363d] bg-[#161b22] space-y-3">
              {ANALYSIS_STEPS.map((step) => {
                const done = completedSteps.includes(step.key);
                const isCurrent =
                  ANALYSIS_STEPS[completedSteps.length]?.key === step.key;
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    {done ? (
                      <span className="text-[#3fb950] font-mono">✓</span>
                    ) : isCurrent ? (
                      <span className="text-[#58a6ff] font-mono animate-pulse">→</span>
                    ) : (
                      <span className="text-[#30363d] font-mono">○</span>
                    )}
                    <span className={done ? "text-[#e6edf3]" : isCurrent ? "text-[#58a6ff]" : "text-[#8b949e]"}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Phase: Proposal */}
        {phase === "proposal" && (
          <div>
            <h1 className="text-2xl font-bold text-[#e6edf3] mb-2">Architecture Proposal</h1>
            <p className="text-[#8b949e] mb-6">LooPR found existing infrastructure and proposed a compliant architecture.</p>

            {/* Existing infra */}
            <div className="mb-6 p-5 rounded-lg border border-[#3fb950]/40 bg-green-900/10">
              <h3 className="text-sm font-semibold text-[#3fb950] uppercase tracking-wider mb-4">Existing Architecture Found</h3>
              <div className="space-y-3">
                {EXISTING_INFRA.map((item) => (
                  <div key={item.name} className="flex items-start gap-3">
                    <span className="text-[#3fb950] font-mono text-xs mt-1">✓</span>
                    <div>
                      <div className="font-mono text-sm text-[#e6edf3]">{item.name}</div>
                      <div className="text-xs text-[#8b949e] font-mono">{item.path}</div>
                      <div className="text-xs text-[#8b949e]">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture diagram */}
            <div className="mb-6 p-5 rounded-lg border border-[#30363d] bg-[#161b22]">
              <h3 className="text-sm font-semibold text-[#8b949e] uppercase tracking-wider mb-4">Proposed Architecture</h3>
              <div className="font-mono text-sm space-y-1 text-[#e6edf3]">
                <div className="text-[#8b949e]">PaymentProcessor</div>
                <div className="pl-4 text-[#8b949e]">↓</div>
                <div className="text-[#e6edf3]">CurrencyService</div>
                <div className="pl-4 text-[#8b949e]">↓</div>
                <div className="text-[#3fb950]">RedisStore</div>
                <div className="pl-8 text-[#8b949e]">↓</div>
                <div className="pl-8 text-[#3fb950]">Shared Cache</div>
                <div className="mt-2 text-[#e6edf3]">CurrencyService</div>
                <div className="pl-4 text-[#8b949e]">↓</div>
                <div className="text-[#3fb950]">withBackoff()</div>
                <div className="pl-8 text-[#8b949e]">↓</div>
                <div className="pl-8 text-[#8b949e]">Rate Provider</div>
              </div>
            </div>

            {/* Decisions */}
            <div className="mb-6 space-y-3">
              {DECISIONS.map((d) => (
                <div key={d.title} className="p-4 rounded-lg border border-[#30363d] bg-[#161b22]">
                  <div className="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Decision: {d.title}</div>
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-[#3fb950] text-xs mt-0.5">✓ CHOSEN</span>
                    <span className="text-sm text-[#e6edf3] font-mono">{d.chosen}</span>
                  </div>
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-[#f85149] text-xs mt-0.5">✗ REJECTED</span>
                    <span className="text-sm text-[#8b949e] font-mono">{d.rejected}</span>
                  </div>
                  <div className="text-xs text-[#8b949e]">Reason: {d.reason}</div>
                </div>
              ))}
            </div>

            {/* Approve */}
            <div className="flex gap-3">
              <button
                onClick={approveContract}
                className="flex-1 py-3 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white font-medium transition-colors"
              >
                Approve Architecture & Create Contract
              </button>
              <button
                onClick={() => setPhase("input")}
                className="px-4 py-3 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              >
                Revise
              </button>
            </div>
          </div>
        )}

        {/* Phase: Contract Created */}
        {phase === "contract-created" && (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-green-900/30 border border-green-800/50 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-[#3fb950]">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-[#e6edf3] mb-2">Architectural Contract Created</h1>
            <p className="text-[#8b949e] mb-8">
              The contract for <strong className="text-[#e6edf3]">{featureName}</strong> is now active.
              LooPR will enforce it when reviewing the implementation PR.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/demo/repositories/demo-ecommerce/contracts/currency-cache"
                className="px-5 py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white font-medium transition-colors"
              >
                View Contract
              </Link>
              <Link
                href="/demo/repositories/demo-ecommerce/pull-requests"
                className="px-5 py-2.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              >
                Review Pull Request
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
