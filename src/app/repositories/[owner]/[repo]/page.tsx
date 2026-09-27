import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getGithubToken } from "@/lib/github/token";
import { getRepoPullRequests } from "@/lib/github/octokit";

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  active: { label: "ACTIVE", color: "text-[#58a6ff] bg-blue-900/30 border-blue-800/40", icon: "●" },
  verified: { label: "VERIFIED", color: "text-[#3fb950] bg-green-900/30 border-green-800/40", icon: "✓" },
  drift_detected: { label: "DRIFT DETECTED", color: "text-[#f85149] bg-red-900/30 border-red-800/40", icon: "✗" },
};

export default async function RepoPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { owner, repo } = await params;
  const fullName = `${owner}/${repo}`;
  const token = await getGithubToken(session.user.id);

  // Upsert the repository record so contracts can reference it
  const repoRecord = await prisma.repository.upsert({
    where: { userId_fullName: { userId: session.user.id, fullName } },
    create: { name: repo, fullName, userId: session.user.id },
    update: {},
  });

  const contracts = await prisma.architecturalContract.findMany({
    where: { repoId: repoRecord.id },
    orderBy: { createdAt: "desc" },
  });

  let openPRCount = 0;
  if (token) {
    try {
      const prs = await getRepoPullRequests(token, owner, repo);
      openPRCount = prs.length;
    } catch { /* ignore */ }
  }

  const base = `/repositories/${owner}/${repo}`;

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <nav className="border-b border-[#30363d] bg-[#161b22] px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">IL</span>
              </div>
              <span className="font-semibold text-[#e6edf3] text-sm group-hover:text-[#58a6ff] transition-colors">IntentLoop</span>
            </Link>
            <span className="text-[#30363d]">/</span>
            <span className="text-sm text-[#8b949e]">{fullName}</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: base, label: "Overview" },
              { href: `${base}/contracts`, label: "Contracts" },
              { href: `${base}/pull-requests`, label: "Pull Requests" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="px-3 py-1.5 rounded text-sm text-[#8b949e] hover:text-[#e6edf3] transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
          <Link href="/api/auth/signout" className="text-xs text-[#8b949e] hover:text-[#e6edf3]">Sign out</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#e6edf3]">{fullName}</h1>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Contracts", value: contracts.length },
            { label: "Open PRs", value: openPRCount },
            { label: "Findings", value: contracts.filter((c) => c.status === "drift_detected").length },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-lg border border-[#30363d] bg-[#161b22]">
              <div className="text-2xl font-bold text-[#e6edf3]">{s.value}</div>
              <div className="text-sm text-[#8b949e]">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#e6edf3]">Architectural Contracts</h2>
            <Link
              href={`${base}/plan`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium transition-colors"
            >
              <span>+</span> Plan New Feature
            </Link>
          </div>

          {contracts.length === 0 ? (
            <div className="border border-[#30363d] rounded-lg bg-[#161b22] p-8 text-center">
              <p className="text-[#8b949e] mb-3">No architectural contracts yet.</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href={`${base}/pull-requests`}
            className="p-4 rounded-lg border border-[#30363d] bg-[#161b22] hover:border-[#58a6ff] transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-[#58a6ff] text-xl">⇄</div>
              <span className="font-medium text-[#e6edf3] group-hover:text-[#58a6ff]">Pull Requests</span>
            </div>
            <p className="text-sm text-[#8b949e]">Review open PRs against architectural contracts.</p>
          </Link>
          <Link
            href={`${base}/plan`}
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
