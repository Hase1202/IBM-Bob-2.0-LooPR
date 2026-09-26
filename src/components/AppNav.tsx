"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

interface NavProps {
  repoName?: string;
  repoId?: string;
  isDemo?: boolean;
}

export function AppNav({ repoName, repoId, isDemo }: NavProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const githubLogin =
    (session?.user as { githubLogin?: string })?.githubLogin ??
    session?.user?.name ??
    "Demo";

  const baseUrl = isDemo
    ? `/demo/repositories/${repoId ?? "demo-ecommerce"}`
    : repoId
    ? `/repositories/${repoId}`
    : null;

  return (
    <nav
      className="border-b border-[#30363d] bg-[#161b22] px-4"
      style={{ position: "sticky", top: 0, zIndex: 50 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link
            href={isDemo ? "/dashboard?demo=true" : "/dashboard"}
            className="flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">IL</span>
            </div>
            <span className="font-semibold text-[#e6edf3] text-sm">
              IntentLoop
            </span>
          </Link>

          {repoName && (
            <>
              <span className="text-[#30363d]">/</span>
              <span className="text-sm text-[#8b949e]">{repoName}</span>
            </>
          )}

          {isDemo && (
            <span className="px-2 py-0.5 rounded text-xs bg-yellow-900/50 text-yellow-400 border border-yellow-800/50">
              DEMO
            </span>
          )}
        </div>

        {/* Repo sub-nav */}
        {baseUrl && (
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: baseUrl, label: "Overview" },
              { href: `${baseUrl}/contracts`, label: "Contracts" },
              { href: `${baseUrl}/pull-requests`, label: "Pull Requests" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-[#0d1117] text-[#e6edf3]"
                    : "text-[#8b949e] hover:text-[#e6edf3]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* User */}
        <div className="flex items-center gap-3">
          {session?.user?.image && (
            <img
              src={session.user.image}
              alt={githubLogin}
              className="w-7 h-7 rounded-full"
            />
          )}
          <span className="text-sm text-[#8b949e]">@{githubLogin}</span>
          {!isDemo && session && (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs text-[#8b949e] hover:text-[#e6edf3] transition-colors"
            >
              Sign out
            </button>
          )}
          {isDemo && (
            <Link
              href="/"
              className="text-xs text-[#8b949e] hover:text-[#58a6ff] transition-colors"
            >
              Exit demo
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
