import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ContractActions } from "./actions";
import { AppNav } from "@/components/AppNav";
import { ExportContractButton } from "./export-button";

const statusConfig: Record<string, { label: string; color: string; textColor: string }> = {
  active: { label: "ACTIVE CONTRACT", color: "text-[#58a6ff] bg-blue-900/30 border-blue-800/40", textColor: "text-[#58a6ff]" },
  verified: { label: "VERIFIED", color: "text-[#3fb950] bg-green-900/30 border-green-800/40", textColor: "text-[#3fb950]" },
  drift_detected: { label: "DRIFT DETECTED", color: "text-[#f85149] bg-red-900/30 border-red-800/40", textColor: "text-[#f85149]" },
};

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string; contractId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { owner, repo, contractId } = await params;
  const base = `/repositories/${owner}/${repo}`;

  const contract = await prisma.architecturalContract.findUnique({
    where: { id: contractId },
  });

  if (!contract || contract.userId !== session.user.id) notFound();

  let contractData: Record<string, unknown> = {};
  try {
    contractData = JSON.parse(contract.contractJson);
  } catch { /* use empty */ }

  const requirements = (contractData.requirements as string[]) ?? [];
  const architectureRules = (contractData.architectureRules as { id: string; description: string }[]) ?? [];
  const requiredDependencies = (contractData.requiredDependencies as string[]) ?? [];
  const forbiddenPatterns = (contractData.forbiddenPatterns as string[]) ?? [];
  const expectedInterfaces = (contractData.expectedInterfaces as { name: string; signature: string; compatibilityRequirement: string }[]) ?? [];
  const edgeCases = (contractData.edgeCases as string[]) ?? [];

  const cfg = statusConfig[contract.status] ?? statusConfig.active;

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <AppNav repoName={repo} repoId={`${owner}/${repo}`} />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#e6edf3]">{contract.feature}</h1>
            <p className="text-[#8b949e] mt-1">{contract.description}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className={`px-3 py-1 rounded border text-sm font-mono ${cfg.color}`}>
              ● {cfg.label}
            </span>
            <div className="flex items-center gap-2">
              <ExportContractButton
                contract={{
                  id: contract.id,
                  feature: contract.feature,
                  status: contract.status,
                  createdAt: contract.createdAt.toISOString(),
                  contractJson: contract.contractJson,
                }}
              />
              <ContractActions owner={owner} repo={repo} contractId={contract.id} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requirements.length > 0 && (
            <div className="p-5 rounded-lg border border-[#30363d] bg-[#161b22]">
              <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-4">Requirements</h2>
              <ul className="space-y-2">
                {requirements.map((r) => (
                  <li key={r} className="flex items-center gap-2 text-sm">
                    <span className="text-[#3fb950]">✓</span>
                    <span className="text-[#e6edf3]">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {architectureRules.length > 0 && (
            <div className="p-5 rounded-lg border border-[#30363d] bg-[#161b22]">
              <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-4">Architecture Rules</h2>
              <ul className="space-y-3">
                {architectureRules.map((r) => (
                  <li key={r.id} className="text-sm">
                    <span className="font-mono text-[#a371f7] text-xs">{r.id}</span>
                    <div className="text-[#e6edf3] mt-0.5">{r.description}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {requiredDependencies.length > 0 && (
            <div className="p-5 rounded-lg border border-[#30363d] bg-[#161b22]">
              <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-4">Required Dependencies</h2>
              <ul className="space-y-1.5">
                {requiredDependencies.map((d) => (
                  <li key={d} className="font-mono text-sm text-[#58a6ff]">{d}</li>
                ))}
              </ul>
            </div>
          )}

          {forbiddenPatterns.length > 0 && (
            <div className="p-5 rounded-lg border border-[#30363d] bg-[#161b22]">
              <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-4">Forbidden Patterns</h2>
              <ul className="space-y-1.5">
                {forbiddenPatterns.map((p) => (
                  <li key={p} className="font-mono text-sm text-[#f85149]">{p}</li>
                ))}
              </ul>
            </div>
          )}

          {expectedInterfaces.length > 0 && (
            <div className="p-5 rounded-lg border border-[#30363d] bg-[#161b22]">
              <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-4">Expected Interfaces</h2>
              {expectedInterfaces.map((i) => (
                <div key={i.name}>
                  <div className="font-mono text-sm text-[#e6edf3]">{i.signature}</div>
                  <div className="text-xs text-[#8b949e] mt-1">{i.compatibilityRequirement}</div>
                </div>
              ))}
            </div>
          )}

          {edgeCases.length > 0 && (
            <div className="p-5 rounded-lg border border-[#30363d] bg-[#161b22]">
              <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-4">Edge Cases</h2>
              <ul className="space-y-1">
                {edgeCases.map((e) => (
                  <li key={e} className="text-sm text-[#8b949e] flex items-center gap-2">
                    <span>•</span><span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href={`${base}/pull-requests`}
            className="px-5 py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium transition-colors"
          >
            Review PR Against Contract
          </Link>
          <Link
            href={`${base}/contracts`}
            className="px-5 py-2.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] text-sm transition-colors"
          >
            All Contracts
          </Link>
        </div>
      </div>
    </div>
  );
}
