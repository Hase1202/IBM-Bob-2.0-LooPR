import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
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
      <AppNav repoName={fullName} repoId={`${owner}/${repo}`} />

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
