"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

const ANALYSIS_STEPS = [
  { key: "structure", label: "Repository structure" },
  { key: "docs", label: "Architecture documentation" },
  { key: "patterns", label: "Existing patterns & abstractions" },
  { key: "dependencies", label: "Service dependencies" },
  { key: "tests", label: "Tests" },
];

type Phase = "input" | "analyzing" | "proposal" | "contract-created";

export default function PlanPage() {
  const router = useRouter();
  const params = useParams<{ owner: string; repo: string }>();
  const owner = params.owner;
  const repo = params.repo;
  const base = `/repositories/${owner}/${repo}`;

  const [phase, setPhase] = useState<Phase>("input");
  const [featureName, setFeatureName] = useState("");
  const [description, setDescription] = useState("");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [contractId, setContractId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startAnalysis() {
    if (!featureName.trim()) return;
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
    setError(null);
    try {
      const res = await fetch(`/api/repositories/${owner}/${repo}/contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureName, description }),
      });
      if (!res.ok) throw new Error("Failed to save contract");
      const data = await res.json();
      setContractId(data.id);
      setPhase("contract-created");
    } catch (e) {
      setError("Could not save contract. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <nav className="border-b border-[#30363d] bg-[#161b22] px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href={base} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">IL</span>
              </div>
              <span className="font-semibold text-[#e6edf3] text-sm">IntentLoop</span>
            </Link>
            <span className="text-[#30363d]">/</span>
            <Link href={base} className="text-sm text-[#8b949e] hover:text-[#58a6ff]">{owner}/{repo}</Link>
            <span className="text-[#30363d]">/</span>
            <span className="text-sm text-[#e6edf3]">Plan Feature</span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {phase === "input" && (
          <div>
            <h1 className="text-2xl font-bold text-[#e6edf3] mb-2">Plan New Feature</h1>
            <p className="text-[#8b949e] mb-8">
              Bob will analyze the repository and generate an architectural contract before you build.
            </p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#e6edf3] mb-1.5">Feature Name</label>
                <input
                  className="w-full px-3 py-2.5 rounded-lg bg-[#161b22] border border-[#30363d] text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] transition-colors"
                  value={featureName}
                  onChange={(e) => setFeatureName(e.target.value)}
                  placeholder="e.g. User Notification System"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#e6edf3] mb-1.5">What are you building?</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#161b22] border border-[#30363d] text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] transition-colors resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you want to build and why..."
                />
              </div>
              <button
                onClick={startAnalysis}
                disabled={!featureName.trim()}
                className="w-full py-3 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze Repository with Bob
              </button>
            </div>
          </div>
        )}

        {phase === "analyzing" && (
          <div>
            <h1 className="text-2xl font-bold text-[#e6edf3] mb-2">Analyzing repository...</h1>
            <p className="text-[#8b949e] mb-8">Bob is examining the codebase for existing patterns and constraints.</p>
            <div className="p-6 rounded-lg border border-[#30363d] bg-[#161b22] space-y-3">
              {ANALYSIS_STEPS.map((step) => {
                const done = completedSteps.includes(step.key);
                const isCurrent = ANALYSIS_STEPS[completedSteps.length]?.key === step.key;
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

        {phase === "proposal" && (
          <div>
            <h1 className="text-2xl font-bold text-[#e6edf3] mb-2">Architecture Proposal</h1>
            <p className="text-[#8b949e] mb-6">
              Review the proposed contract for <strong className="text-[#e6edf3]">{featureName}</strong>.
              Approve to lock in the design intent.
            </p>

            <div className="mb-6 p-5 rounded-lg border border-[#30363d] bg-[#161b22] space-y-4">
              <div>
                <div className="text-xs text-[#8b949e] uppercase tracking-wider mb-1">Feature</div>
                <div className="text-[#e6edf3] font-medium">{featureName}</div>
              </div>
              <div>
                <div className="text-xs text-[#8b949e] uppercase tracking-wider mb-1">Description</div>
                <div className="text-sm text-[#e6edf3]">{description || "No description provided."}</div>
              </div>
              <div>
                <div className="text-xs text-[#8b949e] uppercase tracking-wider mb-1">Requirements captured</div>
                <ul className="space-y-1 mt-1">
                  {[
                    "Implement feature as described",
                    "Follow existing patterns in the repository",
                    "Do not introduce duplicate abstractions",
                    "Preserve compatibility with existing consumers",
                    "Handle edge cases and failures gracefully",
                  ].map((r) => (
                    <li key={r} className="flex items-center gap-2 text-sm">
                      <span className="text-[#3fb950]">✓</span>
                      <span className="text-[#e6edf3]">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg border border-red-800/50 bg-red-900/10 text-sm text-[#f85149]">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={approveContract}
                className="flex-1 py-3 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white font-medium transition-colors"
              >
                Approve Architecture &amp; Create Contract
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

        {phase === "contract-created" && (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-green-900/30 border border-green-800/50 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-[#3fb950]">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-[#e6edf3] mb-2">Architectural Contract Created</h1>
            <p className="text-[#8b949e] mb-8">
              The contract for <strong className="text-[#e6edf3]">{featureName}</strong> is now active.
              Bob will enforce it when reviewing the implementation PR.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {contractId && (
                <Link
                  href={`${base}/contracts/${contractId}`}
                  className="px-5 py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white font-medium transition-colors"
                >
                  View Contract
                </Link>
              )}
              <Link
                href={`${base}/pull-requests`}
                className="px-5 py-2.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              >
                Review a Pull Request
              </Link>
              <Link
                href={base}
                className="px-5 py-2.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              >
                Back to Repository
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
