import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DEMO_REPO } from "@/lib/demo/data";
import { prisma } from "@/lib/db";
import { getUserRepos } from "@/lib/github/octokit";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const params = await searchParams;
  const isDemo = params.demo === "true";
  const session = await auth();

  if (!isDemo && !session?.user) {
    redirect("/");
  }

  const userName =
    isDemo
      ? "demo"
      : (session?.user as { githubLogin?: string })?.githubLogin ??
        session?.user?.name ??
        "developer";

  // Fetch real repos when logged in
  let repos: Awaited<ReturnType<typeof getUserRepos>> = [];
  if (!isDemo && session?.user?.id) {
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "github" },
      select: { access_token: true },
    });
    if (account?.access_token) {
      try {
        repos = await getUserRepos(account.access_token);
      } catch {
        // token expired or revoked — show empty state
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Nav */}
      <nav className="border-b border-[#30363d] bg-[#161b22] px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">IL</span>
            </div>
            <span className="font-semibold text-[#e6edf3] text-sm">IntentLoop</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#8b949e]">@{userName}</span>
            {isDemo && (
              <span className="px-2 py-0.5 rounded text-xs bg-yellow-900/50 text-yellow-400 border border-yellow-800/50">DEMO</span>
            )}
            {isDemo ? (
              <Link href="/" className="text-xs text-[#8b949e] hover:text-[#58a6ff]">Exit demo</Link>
            ) : (
              <Link href="/api/auth/signout" className="text-xs text-[#8b949e] hover:text-[#e6edf3]">Sign out</Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#e6edf3]">
            Welcome, @{userName}
          </h1>
          <p className="text-[#8b949e] mt-1">Select a repository to begin.</p>
        </div>

        {/* Repo list */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#8b949e] uppercase tracking-wider mb-3">
            Your Repositories
          </h2>

          {isDemo ? (
            <DemoRepoCard isDemo={true} />
          ) : (
            <RealRepoSection repos={repos} />
          )}
        </div>
      </div>
    </div>
  );
}

function DemoRepoCard({ isDemo }: { isDemo: boolean }) {
  return (
    <div className="border border-[#30363d] rounded-lg bg-[#161b22] overflow-hidden">
      <Link
        href={`/demo/repositories/demo-ecommerce`}
        className="flex items-center justify-between p-4 hover:bg-[#1c2128] transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0d1117] border border-[#30363d] flex items-center justify-center">
            <svg className="w-5 h-5 text-[#58a6ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#e6edf3] group-hover:text-[#58a6ff] transition-colors">
                {DEMO_REPO.name}
              </span>
              <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-900/50 text-yellow-400 border border-yellow-800/50">
                demo
              </span>
            </div>
            <p className="text-sm text-[#8b949e]">{DEMO_REPO.description}</p>
          </div>
        </div>
        <svg className="w-4 h-4 text-[#8b949e] group-hover:text-[#58a6ff] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

function RealRepoSection({
  repos,
}: {
  repos: Awaited<ReturnType<typeof getUserRepos>>;
}) {
  if (repos.length === 0) {
    return (
      <div className="border border-[#30363d] rounded-lg bg-[#161b22] p-8 text-center">
        <p className="text-[#8b949e] mb-4">No repositories found on your GitHub account.</p>
        <p className="text-sm text-[#8b949e]">
          Or{" "}
          <Link href="/dashboard?demo=true" className="text-[#58a6ff] hover:underline">
            try the demo
          </Link>{" "}
          to explore the full flow.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[#30363d] rounded-lg bg-[#161b22] overflow-hidden divide-y divide-[#30363d]">
      {repos.map((repo) => (
        <Link
          key={repo.id}
          href={`/repositories/${repo.owner.login}/${repo.name}`}
          className="flex items-center justify-between p-4 hover:bg-[#1c2128] transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0d1117] border border-[#30363d] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#58a6ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-[#e6edf3] group-hover:text-[#58a6ff] transition-colors truncate">
                  {repo.full_name}
                </span>
                {repo.private && (
                  <span className="px-1.5 py-0.5 rounded text-xs bg-[#0d1117] text-[#8b949e] border border-[#30363d] flex-shrink-0">
                    private
                  </span>
                )}
                {repo.fork && (
                  <span className="px-1.5 py-0.5 rounded text-xs bg-[#0d1117] text-[#8b949e] border border-[#30363d] flex-shrink-0">
                    fork
                  </span>
                )}
              </div>
              {repo.description && (
                <p className="text-sm text-[#8b949e] truncate mt-0.5">{repo.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1">
                {repo.language && (
                  <span className="text-xs text-[#8b949e]">{repo.language}</span>
                )}
                <span className="text-xs text-[#8b949e]">
                  ★ {repo.stargazers_count}
                </span>
                <span className="text-xs text-[#8b949e]">
                  Updated {new Date(repo.updated_at ?? "").toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <svg className="w-4 h-4 text-[#8b949e] group-hover:text-[#58a6ff] transition-colors flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ))}
    </div>
  );
}
