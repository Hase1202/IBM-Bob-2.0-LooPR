import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getGithubToken } from "@/lib/github/token";
import { getRepoPullRequests } from "@/lib/github/octokit";
import { GlassShell } from "@/components/GlassShell";

export default async function PullRequestsPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { owner, repo } = await params;
  const fullName = `${owner}/${repo}`;
  const base = `/repositories/${owner}/${repo}`;
  const token = await getGithubToken(session.user.id);

  let prs: Awaited<ReturnType<typeof getRepoPullRequests>> = [];
  if (token) {
    try {
      prs = await getRepoPullRequests(token, owner, repo);
    } catch { /* show empty */ }
  }

  const repoRecord = await prisma.repository.findUnique({
    where: { userId_fullName: { userId: session.user.id, fullName } },
  });
  const contracts = repoRecord
    ? await prisma.architecturalContract.findMany({
        where: { repoId: repoRecord.id, status: "active" },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const activeContract = contracts[0] ?? null;

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
            <span className="text-xs text-[#e0eaff] font-mono">Pull Requests</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <div className="text-xs font-mono text-blue-500/60 mb-2">// pull-requests</div>
          <h1 className="text-2xl font-bold text-[#e0eaff]">Open Pull Requests</h1>
        </div>

        {prs.length === 0 ? (
          <div className="glass p-8 text-center">
            <p className="text-[#6b80a8] text-sm">No open pull requests found for this repository.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {prs.map((pr) => (
              <div key={pr.number} className="glass glow-blue-sm overflow-hidden">
                <div className="p-5">
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
                        <span className="text-[#6b80a8] text-xs font-mono">#{pr.number}</span>
                      </div>
                      <h2 className="text-base font-semibold text-[#e0eaff]">{pr.title}</h2>
                      {pr.body && (
                        <p className="text-xs text-[#6b80a8] mt-1 line-clamp-2">{pr.body}</p>
                      )}
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-mono flex-shrink-0"
                      style={{ color: "#22d3a0", background: "rgba(34,211,160,0.10)", border: "1px solid rgba(34,211,160,0.30)" }}
                    >
                      OPEN
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#6b80a8] mb-4 font-mono">
                    <span>by @{pr.user?.login}</span>
                  </div>

                  {activeContract && (
                    <div
                      className="flex items-center justify-between p-3 rounded-lg mb-4"
                      style={{ background: "rgba(43,127,255,0.06)", border: "1px solid rgba(43,127,255,0.20)" }}
                    >
                      <div>
                        <div className="text-xs text-[#6b80a8] font-mono mb-0.5">Active Architectural Contract</div>
                        <Link
                          href={`${base}/contracts/${activeContract.id}`}
                          className="text-xs text-blue-400 hover:underline font-mono"
                        >
                          {activeContract.feature}
                        </Link>
                      </div>
                      <span
                        className="text-xs font-mono px-2 py-0.5 rounded"
                        style={{ color: "#60a5fa", background: "rgba(43,127,255,0.12)", border: "1px solid rgba(43,127,255,0.25)" }}
                      >
                        ● ACTIVE
                      </span>
                    </div>
                  )}

                  <Link
                    href={`${base}/pull-requests/${pr.number}/review${activeContract ? `?contractId=${activeContract.id}` : ""}`}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Review With Bob
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {contracts.length === 0 && (
          <div
            className="mt-6 p-4 rounded-xl"
            style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)" }}
          >
            <p className="text-xs text-[#f59e0b] font-mono">
              No active architectural contract found.{" "}
              <Link href={`${base}/plan`} className="text-blue-400 hover:underline">
                Plan a feature first
              </Link>{" "}
              to enable intent-drift review.
            </p>
          </div>
        )}
      </div>
    </GlassShell>
  );
}
