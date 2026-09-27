import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
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

export default async function ContractsPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { owner, repo } = await params;
  const fullName = `${owner}/${repo}`;
  const base = `/repositories/${owner}/${repo}`;

  const repoRecord = await prisma.repository.findUnique({
    where: { userId_fullName: { userId: session.user.id, fullName } },
  });

  const contracts = repoRecord
    ? await prisma.architecturalContract.findMany({
        where: { repoId: repoRecord.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <GlassShell>
      {/* Nav */}
      <nav className="glass-nav sticky top-0 z-50 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3 text-sm">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1e5adc 0%, #0a2fa8 100%)", border: "1px solid rgba(60,120,255,0.4)" }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7 C2 4.2 4.2 2 7 2 C9.8 2 12 4.2 12 7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 7 C12 9.8 9.8 12 7 12" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round"/><circle cx="7" cy="12" r="1.2" fill="white"/><path d="M10.5 5.5 L12 7 L13.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span className="font-semibold text-[#e0eaff] text-sm group-hover:text-blue-400 transition-colors tracking-wide">LooPR</span>
            </Link>
            <span className="text-blue-900/60">/</span>
            <Link href={base} className="text-xs text-[#6b80a8] hover:text-blue-400 font-mono">{fullName}</Link>
            <span className="text-blue-900/60">/</span>
            <span className="text-xs text-[#e0eaff] font-mono">Contracts</span>
          </div>
          <Link
            href={`${base}/plan`}
            className="btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-medium font-mono"
          >
            + Plan New Feature
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <div className="text-xs font-mono text-blue-500/60 mb-2">// contracts</div>
          <h1 className="text-2xl font-bold text-[#e0eaff]">Architectural Contracts</h1>
        </div>

        {contracts.length === 0 ? (
          <div className="glass p-8 text-center">
            <p className="text-[#6b80a8] text-sm mb-3">No contracts yet for this repository.</p>
            <Link href={`${base}/plan`} className="text-xs text-blue-400 hover:underline font-mono">
              Plan your first feature →
            </Link>
          </div>
        ) : (
          <div className="glass overflow-hidden">
            {contracts.map((contract, i) => {
              const cfg = statusConfig[contract.status] ?? statusConfig.active;
              return (
                <Link
                  key={contract.id}
                  href={`${base}/contracts/${contract.id}`}
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
        )}
      </div>
    </GlassShell>
  );
}
