import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getGithubToken } from "@/lib/github/token";
import { getRepoPullRequests } from "@/lib/github/octokit";

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

  // Load contracts so we can show which contract links to each PR
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
            <span className="text-[#e6edf3]">Pull Requests</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#e6edf3] mb-6">Open Pull Requests</h1>

        {prs.length === 0 ? (
          <div className="border border-[#30363d] rounded-lg bg-[#161b22] p-8 text-center">
            <p className="text-[#8b949e]">No open pull requests found for this repository.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {prs.map((pr) => (
              <div key={pr.number} className="border border-[#30363d] rounded-lg bg-[#161b22] overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-[#238636] flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v12m0 0l-4-4m4 4l4-4" />
                          </svg>
                        </span>
                        <span className="text-[#8b949e] text-sm">#{pr.number}</span>
                      </div>
                      <h2 className="text-lg font-semibold text-[#e6edf3]">{pr.title}</h2>
                      {pr.body && (
                        <p className="text-sm text-[#8b949e] mt-1 line-clamp-2">{pr.body}</p>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded text-xs font-mono border text-[#238636] border-[#238636]/40 bg-green-900/20 flex-shrink-0">
                      OPEN
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-[#8b949e] mb-4">
                    <span>by @{pr.user?.login}</span>
                  </div>

                  {activeContract && (
                    <div className="flex items-center justify-between p-3 rounded border border-[#58a6ff]/30 bg-blue-900/10 mb-4">
                      <div>
                        <div className="text-xs text-[#8b949e] mb-0.5">Active Architectural Contract</div>
                        <Link
                          href={`${base}/contracts/${activeContract.id}`}
                          className="text-sm text-[#58a6ff] hover:underline"
                        >
                          {activeContract.feature}
                        </Link>
                      </div>
                      <span className="text-xs text-[#58a6ff]">● ACTIVE</span>
                    </div>
                  )}

                  <Link
                    href={`${base}/pull-requests/${pr.number}/review${activeContract ? `?contractId=${activeContract.id}` : ""}`}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#1f6feb] hover:bg-[#388bfd]/80 text-white font-medium transition-colors"
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
          <div className="mt-6 p-4 rounded-lg border border-[#d29922]/40 bg-yellow-900/10">
            <p className="text-sm text-[#d29922]">
              No active architectural contract found.{" "}
              <Link href={`${base}/plan`} className="text-[#58a6ff] hover:underline">
                Plan a feature first
              </Link>{" "}
              to enable intent-drift review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
