import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DEMO_REPO } from "@/lib/demo/data";
import { prisma } from "@/lib/db";
import { getUserRepos } from "@/lib/github/octokit";
import { GlassShell } from "@/components/GlassShell";
import { AsciiStream } from "@/components/AsciiStream";
import { RepoList } from "@/components/RepoList";

import { Logo } from "@/components/Logo";

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
    <GlassShell>
      {/* Nav */}
      <nav className="glass-nav sticky top-0 z-50 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href={isDemo ? "/dashboard?demo=true" : "/dashboard"} className="flex items-center gap-2 group">
              <Logo size={28} priority />
              <span className="font-bold text-[#e0eaff] text-sm group-hover:text-blue-400 transition-colors tracking-wide">LooPR</span>
            </Link>
            {isDemo && (
              <span className="px-2 py-0.5 rounded-md text-xs font-mono"
                style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.30)", color: "#f59e0b" }}>
                DEMO
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6b80a8] font-mono hidden sm:inline">@{userName}</span>
            {isDemo ? (
              <Link href="/" className="flex items-center gap-1.5 text-xs text-[#6b80a8] hover:text-blue-400 transition-colors px-2 py-1 rounded-lg hover:bg-blue-500/10">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Exit demo
              </Link>
            ) : (
              <form action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}>
                <button type="submit" className="flex items-center gap-1.5 text-xs text-[#6b80a8] hover:text-[#e0eaff] transition-colors px-2 py-1 rounded-lg hover:bg-blue-500/10">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </form>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Welcome */}
        <div className="mb-8">
          <div className="text-xs font-mono text-blue-500/60 mb-2">// dashboard</div>
          <h1 className="text-2xl font-bold text-[#e0eaff]">
            Welcome,{" "}
            <span className="text-glow-sm" style={{ color: "#2b7fff" }}>@{userName}</span>
          </h1>
          <p className="text-sm text-[#6b80a8] mt-1 mb-3">Select a repository to begin reviewing PRs.</p>
          <AsciiStream />
        </div>

        {/* Repo section */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-3.5 h-3.5 text-blue-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="text-xs font-mono text-[#6b80a8] uppercase tracking-wider">
              {isDemo ? "Demo Repository" : `Repositories (${repos.length})`}
            </span>
            <div className="glass-divider flex-1" />
          </div>

          {isDemo ? (
            <DemoRepoCard />
          ) : repos.length === 0 ? (
            <EmptyState />
          ) : (
            <RepoList repos={repos} />
          )}
        </div>
      </div>
    </GlassShell>
  );
}

function DemoRepoCard() {
  return (
    <div className="glass overflow-hidden glow-blue-sm">
      <Link
        href="/demo/repositories/demo-ecommerce"
        className="flex items-center justify-between p-5 hover:bg-blue-500/5 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(10,14,30,0.8)", border: "1px solid rgba(43,127,255,0.25)" }}
          >
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium text-[#e0eaff] group-hover:text-blue-400 transition-colors">
                {DEMO_REPO.name}
              </span>
              <span className="px-1.5 py-0.5 rounded text-xs font-mono"
                style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b" }}>
                demo
              </span>
            </div>
            <p className="text-xs text-[#6b80a8]">{DEMO_REPO.description}</p>
          </div>
        </div>
        <svg className="w-4 h-4 text-[#6b80a8] group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass p-10 text-center">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
        style={{ background: "rgba(43,127,255,0.08)", border: "1px solid rgba(43,127,255,0.18)" }}
      >
        <svg className="w-6 h-6 text-blue-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </div>
      <p className="text-sm text-[#6b80a8] mb-1">No repositories found.</p>
      <p className="text-xs text-[#6b80a8]/60 mb-5">
        Make sure your GitHub token has the{" "}
        <span className="font-mono text-blue-400/80">repo</span> scope.
      </p>
      <Link href="/dashboard?demo=true" className="btn-glass inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Try the demo instead
      </Link>
    </div>
  );
}
