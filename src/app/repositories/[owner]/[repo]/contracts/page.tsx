import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  active: { label: "ACTIVE", color: "text-[#58a6ff] bg-blue-900/30 border-blue-800/40", icon: "●" },
  verified: { label: "VERIFIED", color: "text-[#3fb950] bg-green-900/30 border-green-800/40", icon: "✓" },
  drift_detected: { label: "DRIFT DETECTED", color: "text-[#f85149] bg-red-900/30 border-red-800/40", icon: "✗" },
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
    <div className="min-h-screen bg-[#0d1117]">
      <nav className="border-b border-[#30363d] bg-[#161b22] px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3 text-sm">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">IL</span>
              </div>
              <span className="font-semibold text-[#e6edf3]">IntentLoop</span>
            </Link>
            <span className="text-[#30363d]">/</span>
            <Link href={base} className="text-[#8b949e] hover:text-[#58a6ff]">{fullName}</Link>
            <span className="text-[#30363d]">/</span>
            <span className="text-[#e6edf3]">Contracts</span>
          </div>
          <Link href={`${base}/plan`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium transition-colors">
            + Plan New Feature
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#e6edf3] mb-6">Architectural Contracts</h1>

        {contracts.length === 0 ? (
          <div className="border border-[#30363d] rounded-lg bg-[#161b22] p-8 text-center">
            <p className="text-[#8b949e] mb-3">No contracts yet for this repository.</p>
            <Link href={`${base}/plan`} className="text-sm text-[#58a6ff] hover:underline">
              Plan your first feature →
            </Link>
          </div>
        ) : (
          <div className="border border-[#30363d] rounded-lg bg-[#161b22] overflow-hidden divide-y divide-[#30363d]">
            {contracts.map((contract) => {
              const cfg = statusConfig[contract.status] ?? statusConfig.active;
              return (
                <Link
                  key={contract.id}
                  href={`${base}/contracts/${contract.id}`}
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
        )}
      </div>
    </div>
  );
}
