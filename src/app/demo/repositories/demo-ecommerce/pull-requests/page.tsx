import Link from "next/link";
import { DEMO_PR } from "@/lib/demo/data";
import { GlassShell } from "@/components/GlassShell";

const base = "/demo/repositories/demo-ecommerce";

export default function PullRequestsPage() {
  return (
    <GlassShell>
      {/* Nav */}
      <nav className="glass-nav sticky top-0 z-50 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3 text-sm">
            <Link href={base} className="flex items-center gap-2 group">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1e5adc 0%, #0a2fa8 100%)", border: "1px solid rgba(60,120,255,0.4)" }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7 C2 4.2 4.2 2 7 2 C9.8 2 12 4.2 12 7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 7 C12 9.8 9.8 12 7 12" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round"/><circle cx="7" cy="12" r="1.2" fill="white"/><path d="M10.5 5.5 L12 7 L13.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span className="font-semibold text-[#e0eaff] text-sm group-hover:text-blue-400 transition-colors tracking-wide">LooPR</span>
            </Link>
            <span className="text-blue-900/60">/</span>
            <Link href={base} className="text-xs text-[#6b80a8] hover:text-blue-400 font-mono">ecommerce-platform</Link>
            <span className="text-blue-900/60">/</span>
            <span className="text-xs text-[#e0eaff] font-mono">Pull Requests</span>
          </div>
          <span
            className="px-2 py-0.5 rounded-md text-xs font-mono"
            style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.30)", color: "#f59e0b" }}
          >
            DEMO
          </span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <div className="text-xs font-mono text-blue-500/60 mb-2">// pull-requests</div>
          <h1 className="text-2xl font-bold text-[#e0eaff]">Pull Requests</h1>
        </div>

        <div className="glass glow-blue-sm overflow-hidden">
          <div className="p-5">
            {/* PR Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(34,211,160,0.15)", border: "1px solid rgba(34,211,160,0.35)" }}
                  >
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                  </span>
                  <span className="text-[#6b80a8] text-xs font-mono">#{DEMO_PR.number}</span>
                </div>
                <h2 className="text-base font-semibold text-[#e0eaff]">{DEMO_PR.title}</h2>
              </div>
              <span
                className="px-2 py-0.5 rounded text-xs font-mono"
                style={{ color: "#22d3a0", background: "rgba(34,211,160,0.10)", border: "1px solid rgba(34,211,160,0.30)" }}
              >
                OPEN
              </span>
            </div>

            {/* PR Meta */}
            <div className="flex items-center gap-6 text-xs text-[#6b80a8] font-mono mb-4">
              <span>{DEMO_PR.filesChanged} files changed</span>
              <span style={{ color: "#22d3a0" }}>+{DEMO_PR.additions}</span>
              <span style={{ color: "#f43f5e" }}>-{DEMO_PR.deletions}</span>
            </div>

            {/* Files */}
            <div
              className="mb-5 p-3 rounded-lg"
              style={{ background: "rgba(0,5,20,0.8)", border: "1px solid rgba(43,127,255,0.15)" }}
            >
              <div className="text-xs text-[#6b80a8] mb-2 uppercase tracking-wider font-mono">Changed Files</div>
              <ul className="space-y-1">
                {DEMO_PR.files.map((f) => (
                  <li key={f.path} className="flex items-center justify-between text-xs font-mono">
                    <span className="text-blue-400">{f.path}</span>
                    <span className="text-[#6b80a8]">
                      <span style={{ color: "#22d3a0" }}>+{f.additions}</span>
                      {" "}<span style={{ color: "#f43f5e" }}>-{f.deletions}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contract link */}
            <div
              className="flex items-center justify-between p-3 rounded-lg mb-5"
              style={{ background: "rgba(43,127,255,0.06)", border: "1px solid rgba(43,127,255,0.20)" }}
            >
              <div>
                <div className="text-xs text-[#6b80a8] font-mono mb-0.5">Architectural Contract</div>
                <Link
                  href={`${base}/contracts/currency-cache`}
                  className="text-xs text-blue-400 hover:underline font-mono"
                >
                  Currency Rate Caching
                </Link>
              </div>
              <span
                className="text-xs font-mono px-2 py-0.5 rounded"
                style={{ color: "#60a5fa", background: "rgba(43,127,255,0.12)", border: "1px solid rgba(43,127,255,0.25)" }}
              >
                ● ACTIVE
              </span>
            </div>

            {/* CTA */}
            <Link
              href={`${base}/pull-requests/142/review`}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Review With Bob
            </Link>
          </div>
        </div>
      </div>
    </GlassShell>
  );
}
