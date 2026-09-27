import Link from "next/link";
import { DEMO_CONTRACTS, DEMO_REPO } from "@/lib/demo/data";
import { GlassShell } from "@/components/GlassShell";

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
      {/* Nav */}
      <nav className="glass-nav sticky top-0 z-50 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/dashboard?demo=true" className="flex items-center gap-2 group">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1e5adc 0%, #0a2fa8 100%)", border: "1px solid rgba(60,120,255,0.4)" }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7 C2 4.2 4.2 2 7 2 C9.8 2 12 4.2 12 7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 7 C12 9.8 9.8 12 7 12" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round"/><circle cx="7" cy="12" r="1.2" fill="white"/><path d="M10.5 5.5 L12 7 L13.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span className="font-semibold text-[#e0eaff] text-sm group-hover:text-blue-400 transition-colors tracking-wide">LooPR</span>
            </Link>
            <span className="text-blue-900/60">/</span>
            <span className="text-xs text-[#6b80a8] font-mono">{DEMO_REPO.name}</span>
            <span
              className="px-2 py-0.5 rounded-md text-xs font-mono"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.30)", color: "#f59e0b" }}
            >
              DEMO
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: base, label: "Overview" },
              { href: `${base}/contracts`, label: "Contracts" },
              { href: `${base}/pull-requests`, label: "Pull Requests" },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="px-3 py-1.5 rounded-lg text-xs font-mono text-[#6b80a8] hover:text-[#e0eaff] transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
          <Link href="/" className="text-xs text-[#6b80a8] hover:text-blue-400 transition-colors">Exit demo</Link>
        </div>
      </nav>

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
            <p className="text-xs text-[#6b80a8]">Let Bob analyze the architecture before you build.</p>
          </Link>
        </div>
      </div>
    </GlassShell>
  );
}
