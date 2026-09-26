import Link from "next/link";
import { DEMO_CONTRACTS, DEMO_REPO } from "@/lib/demo/data";

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  active: { label: "ACTIVE", color: "text-[#58a6ff] bg-blue-900/30 border-blue-800/40", icon: "●" },
  verified: { label: "VERIFIED", color: "text-[#3fb950] bg-green-900/30 border-green-800/40", icon: "✓" },
  drift_detected: { label: "DRIFT DETECTED", color: "text-[#f85149] bg-red-900/30 border-red-800/40", icon: "✗" },
};

export default function DemoRepoPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <nav className="border-b border-[#30363d] bg-[#161b22] px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/dashboard?demo=true" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">IL</span>
              </div>
              <span className="font-semibold text-[#e6edf3] text-sm group-hover:text-[#58a6ff] transition-colors">IntentLoop</span>
            </Link>
            <span className="text-[#30363d]">/</span>
            <span className="text-sm text-[#8b949e]">{DEMO_REPO.name}</span>
            <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-900/50 text-yellow-400 border border-yellow-800/50">DEMO</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: "/demo/repositories/demo-ecommerce", label: "Overview" },
              { href: "/demo/repositories/demo-ecommerce/contracts", label: "Contracts" },
              { href: "/demo/repositories/demo-ecommerce/pull-requests", label: "Pull Requests" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="px-3 py-1.5 rounded text-sm text-[#8b949e] hover:text-[#e6edf3] transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
          <Link href="/" className="text-xs text-[#8b949e] hover:text-[#58a6ff]">Exit demo</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Repo header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-[#e6edf3]">{DEMO_REPO.name}</h1>
          </div>
          <p className="text-[#8b949e]">{DEMO_REPO.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Contracts", value: "3" },
            { label: "Open PRs", value: "1" },
            { label: "Findings", value: "2" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-lg border border-[#30363d] bg-[#161b22]">
              <div className="text-2xl font-bold text-[#e6edf3]">{s.value}</div>
              <div className="text-sm text-[#8b949e]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Contracts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#e6edf3]">Architectural Contracts</h2>
            <Link
              href="/demo/repositories/demo-ecommerce/plan"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium transition-colors"
            >
              <span>+</span> Plan New Feature
            </Link>
          </div>

          <div className="border border-[#30363d] rounded-lg bg-[#161b22] overflow-hidden divide-y divide-[#30363d]">
            {DEMO_CONTRACTS.map((contract) => {
              const cfg = statusConfig[contract.status];
              return (
                <Link
                  key={contract.id}
                  href={
                    contract.id === "contract-currency-cache"
                      ? `/demo/repositories/demo-ecommerce/contracts/currency-cache`
                      : "#"
                  }
                  className="flex items-center justify-between p-4 hover:bg-[#1c2128] transition-colors group"
                >
                  <div>
                    <div className="font-medium text-[#e6edf3] group-hover:text-[#58a6ff] transition-colors">
                      {contract.feature}
                    </div>
                    <div className="text-sm text-[#8b949e] mt-0.5">{contract.description}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono border ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/demo/repositories/demo-ecommerce/pull-requests"
            className="p-4 rounded-lg border border-[#30363d] bg-[#161b22] hover:border-[#58a6ff] transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-[#f85149] text-xl">!</div>
              <span className="font-medium text-[#e6edf3] group-hover:text-[#58a6ff]">PR #142 awaiting review</span>
            </div>
            <p className="text-sm text-[#8b949e]">Add Currency Rate Caching — 5 files changed</p>
          </Link>

          <Link
            href="/demo/repositories/demo-ecommerce/plan"
            className="p-4 rounded-lg border border-[#30363d] bg-[#161b22] hover:border-[#58a6ff] transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-[#58a6ff] text-xl">+</div>
              <span className="font-medium text-[#e6edf3] group-hover:text-[#58a6ff]">Plan a new feature</span>
            </div>
            <p className="text-sm text-[#8b949e]">Let Bob analyze the architecture before you build.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
