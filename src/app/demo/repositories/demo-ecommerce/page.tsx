import Link from "next/link";
import { DEMO_CONTRACTS, DEMO_REPO } from "@/lib/demo/data";
import { GlassShell } from "@/components/GlassShell";
import { AppNav } from "@/components/AppNav";

const statusConfig: Record<string, { label: string; colorStyle: React.CSSProperties; icon: string }> = {
  active: {
    label: "ACTIVE",
    icon: "●",
    colorStyle: { color: "#60a5fa", background: "rgba(43,127,255,0.10)", border: "1px solid rgba(43,127,255,0.30)" },
  },
  verified: {
    label: "VERIFIED",
    icon: "✓",
    colorStyle: { color: "#22d3a0", background: "rgba(34,211,160,0.10)", border: "1px solid rgba(34,211,160,0.30)" },
  },
  drift_detected: {
    label: "DRIFT DETECTED",
    icon: "✗",
    colorStyle: { color: "#f43f5e", background: "rgba(244,63,94,0.10)", border: "1px solid rgba(244,63,94,0.30)" },
  },
};

const base = "/demo/repositories/demo-ecommerce";

export default function DemoRepoPage() {
  return (
    <GlassShell>
      <AppNav repoName={DEMO_REPO.name} repoId="demo-ecommerce" isDemo />

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="text-xs font-mono text-blue-500/60 mb-2">// demo · repository</div>
          <h1 className="text-2xl font-bold text-[#e0eaff]">{DEMO_REPO.name}</h1>
          <p className="text-sm text-[#6b80a8] mt-1">{DEMO_REPO.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Contracts", value: "3", icon: "▣" },
            { label: "Open PRs", value: "1", icon: "⇄" },
            { label: "Findings", value: "2", icon: "◎" },
          ].map((s) => (
            <div key={s.label} className="glass p-5">
              <div className="text-xs font-mono text-blue-500/50 mb-1">{s.icon}</div>
              <div className="text-3xl font-bold text-[#e0eaff] text-glow-sm">{s.value}</div>
              <div className="text-xs text-[#6b80a8] mt-1 font-mono">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Contracts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#e0eaff]">Architectural Contracts</h2>
              <div className="glass-divider w-16" />
            </div>
            <Link
              href={`${base}/plan`}
              className="btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-medium font-mono"
            >
              + Plan New Feature
            </Link>
          </div>

          <div className="glass overflow-hidden">
            {DEMO_CONTRACTS.map((contract, i) => {
              const cfg = statusConfig[contract.status];
              return (
                <Link
                  key={contract.id}
                  href={
                    contract.id === "contract-currency-cache"
                      ? `${base}/contracts/currency-cache`
                      : "#"
                  }
                  className="flex items-center justify-between p-4 hover:bg-blue-500/5 transition-colors group"
                  style={i > 0 ? { borderTop: "1px solid rgba(0,120,255,0.10)" } : undefined}
                >
                  <div>
                    <div className="font-medium text-[#e0eaff] group-hover:text-blue-400 transition-colors text-sm">
                      {contract.feature}
                    </div>
                    <div className="text-xs text-[#6b80a8] mt-0.5">{contract.description}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-mono" style={cfg.colorStyle}>
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
            href={`${base}/pull-requests`}
            className="glass p-5 hover:bg-blue-500/5 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[#f43f5e] text-lg font-mono">!</span>
              <span className="font-medium text-[#e0eaff] group-hover:text-blue-400 transition-colors text-sm">PR #142 awaiting review</span>
            </div>
            <p className="text-xs text-[#6b80a8]">Add Currency Rate Caching — 5 files changed</p>
          </Link>

          <Link
            href={`${base}/plan`}
            className="glass p-5 hover:bg-blue-500/5 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-blue-400 text-lg font-mono text-glow-sm">+</span>
              <span className="font-medium text-[#e0eaff] group-hover:text-blue-400 transition-colors text-sm">Plan a new feature</span>
            </div>
            <p className="text-xs text-[#6b80a8]">Let LooPR analyze the architecture before you build.</p>
          </Link>
        </div>
      </div>
    </GlassShell>
  );
}
