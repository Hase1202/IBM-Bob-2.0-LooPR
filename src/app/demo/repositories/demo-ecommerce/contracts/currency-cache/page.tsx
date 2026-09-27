import Link from "next/link";
import { DEMO_CONTRACT_FULL } from "@/lib/demo/data";

export default function ContractPage() {
  const c = DEMO_CONTRACT_FULL;

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Nav */}
      <nav className="border-b border-[#30363d] bg-[#161b22] px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3 text-sm">
            <Link href="/demo/repositories/demo-ecommerce" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7 C2 4.2 4.2 2 7 2 C9.8 2 12 4.2 12 7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 7 C12 9.8 9.8 12 7 12" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round"/><circle cx="7" cy="12" r="1.2" fill="white"/><path d="M10.5 5.5 L12 7 L13.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span className="font-semibold text-[#e6edf3]">LooPR</span>
            </Link>
            <span className="text-[#30363d]">/</span>
            <Link href="/demo/repositories/demo-ecommerce" className="text-[#8b949e] hover:text-[#58a6ff]">ecommerce-platform</Link>
            <span className="text-[#30363d]">/</span>
            <Link href="/demo/repositories/demo-ecommerce/contracts" className="text-[#8b949e] hover:text-[#58a6ff]">contracts</Link>
            <span className="text-[#30363d]">/</span>
            <span className="text-[#e6edf3]">{c.feature}</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-900/50 text-yellow-400 border border-yellow-800/50">DEMO</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#e6edf3]">{c.featureLabel}</h1>
            <p className="text-[#8b949e] mt-1">{c.description}</p>
          </div>
          <span className="px-3 py-1 rounded border text-sm font-mono text-[#58a6ff] bg-blue-900/30 border-blue-800/40">
            ● ACTIVE CONTRACT
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Requirements */}
          <div className="p-5 rounded-lg border border-[#30363d] bg-[#161b22]">
            <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-4">Requirements</h2>
            <ul className="space-y-2">
              {c.requirements.map((r) => (
                <li key={r} className="flex items-center gap-2 text-sm">
                  <span className="text-[#3fb950]">✓</span>
                  <span className="text-[#e6edf3]">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Architecture Rules */}
          <div className="p-5 rounded-lg border border-[#30363d] bg-[#161b22]">
            <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-4">Architecture Rules</h2>
            <ul className="space-y-3">
              {c.architectureRules.map((r) => (
                <li key={r.id} className="text-sm">
                  <span className="font-mono text-[#a371f7] text-xs">{r.id}</span>
                  <div className="text-[#e6edf3] mt-0.5">{r.description}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Required Dependencies */}
          <div className="p-5 rounded-lg border border-[#30363d] bg-[#161b22]">
            <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-4">Required Dependencies</h2>
            <ul className="space-y-1.5">
              {c.requiredDependencies.map((d) => (
                <li key={d} className="font-mono text-sm text-[#58a6ff]">{d}</li>
              ))}
            </ul>
          </div>

          {/* Forbidden Patterns */}
          <div className="p-5 rounded-lg border border-[#30363d] bg-[#161b22]">
            <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-4">Forbidden Patterns</h2>
            <ul className="space-y-1.5">
              {c.forbiddenPatterns.map((p) => (
                <li key={p} className="font-mono text-sm text-[#f85149]">{p}</li>
              ))}
            </ul>
          </div>

          {/* Expected Interfaces */}
          <div className="p-5 rounded-lg border border-[#30363d] bg-[#161b22]">
            <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-4">Expected Interfaces</h2>
            {c.expectedInterfaces.map((i) => (
              <div key={i.name}>
                <div className="font-mono text-sm text-[#e6edf3]">{i.signature}</div>
                <div className="text-xs text-[#8b949e] mt-1">{i.compatibilityRequirement}</div>
              </div>
            ))}
          </div>

          {/* Edge Cases */}
          <div className="p-5 rounded-lg border border-[#30363d] bg-[#161b22]">
            <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-4">Edge Cases</h2>
            <ul className="space-y-1">
              {c.edgeCases.map((e) => (
                <li key={e} className="text-sm text-[#8b949e] flex items-center gap-2">
                  <span>•</span><span>{e}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Architecture Diagram */}
        <div className="mt-6 p-5 rounded-lg border border-[#30363d] bg-[#161b22]">
          <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-4">Architecture Diagram</h2>
          <div className="font-mono text-sm space-y-1">
            <div className="text-[#8b949e]">PaymentProcessor</div>
            <div className="pl-6 text-[#8b949e]">↓</div>
            <div className="text-[#e6edf3]">CurrencyService</div>
            <div className="pl-6 text-[#8b949e]">↓</div>
            <div className="text-[#3fb950] font-medium">RedisStore</div>
            <div className="pl-10 text-[#8b949e]">↓</div>
            <div className="pl-10 text-[#3fb950]">Shared Cache</div>
            <div className="mt-3 text-[#e6edf3]">CurrencyService</div>
            <div className="pl-6 text-[#8b949e]">↓</div>
            <div className="text-[#3fb950] font-medium">withBackoff()</div>
            <div className="pl-10 text-[#8b949e]">↓</div>
            <div className="pl-10 text-[#8b949e]">External Rate Provider</div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Link
            href="/demo/repositories/demo-ecommerce/pull-requests/142/review"
            className="px-5 py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium transition-colors"
          >
            Review PR Against Contract
          </Link>
          <Link
            href="/demo/repositories/demo-ecommerce/pull-requests"
            className="px-5 py-2.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] text-sm transition-colors"
          >
            View Pull Requests
          </Link>
        </div>
      </div>
    </div>
  );
}
