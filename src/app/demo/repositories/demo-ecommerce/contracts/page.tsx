import Link from "next/link";
import { DEMO_CONTRACTS } from "@/lib/demo/data";

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  active: { label: "ACTIVE", color: "text-[#58a6ff] bg-blue-900/30 border-blue-800/40", icon: "●" },
  verified: { label: "VERIFIED", color: "text-[#3fb950] bg-green-900/30 border-green-800/40", icon: "✓" },
  drift_detected: { label: "DRIFT DETECTED", color: "text-[#f85149] bg-red-900/30 border-red-800/40", icon: "✗" },
};

export default function ContractsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
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
            <Link href="/demo/repositories/demo-ecommerce" className="text-[#8b949e] hover:text-[#58a6ff]">ecommerce-platform</Link>
            <span className="text-[#30363d]">/</span>
            <span className="text-[#e6edf3]">Contracts</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-900/50 text-yellow-400 border border-yellow-800/50">DEMO</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#e6edf3]">Architectural Contracts</h1>
          <Link
            href="/demo/repositories/demo-ecommerce/plan"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium transition-colors"
          >
            + Plan New Feature
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
    </div>
  );
}
