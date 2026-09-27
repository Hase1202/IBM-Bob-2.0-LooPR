import Link from "next/link";
import { DEMO_CONTRACTS } from "@/lib/demo/data";
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

export default function ContractsPage() {
  return (
    <GlassShell>
      <AppNav repoName="ecommerce-platform" repoId="demo-ecommerce" isDemo />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs font-mono text-blue-500/60 mb-2">// contracts</div>
            <h1 className="text-2xl font-bold text-[#e0eaff]">Architectural Contracts</h1>
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
    </GlassShell>
  );
}
