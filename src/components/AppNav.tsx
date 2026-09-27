"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface NavProps {
  repoName?: string;
  /** Full "owner/repo" string used to build sub-nav URLs */
  repoId?: string;
  isDemo?: boolean;
}

// Icons for each sub-nav tab
const TAB_ICONS: Record<string, React.ReactNode> = {
  Overview: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Contracts: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  "Pull Requests": (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
};

import { Logo } from "@/components/Logo";

export function AppNav({ repoName, repoId, isDemo }: NavProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const githubLogin =
    (session?.user as { githubLogin?: string })?.githubLogin ??
    session?.user?.name ??
    "User";

  const baseUrl = isDemo
    ? `/demo/repositories/${repoId ?? "demo-ecommerce"}`
    : repoId
    ? `/repositories/${repoId}`
    : null;

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmSignOut(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function isActive(href: string) {
    if (href === baseUrl) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <nav className="glass-nav sticky top-0 z-50 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14">

        {/* ── Logo + breadcrumb ── */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href={isDemo ? "/dashboard?demo=true" : "/dashboard"} className="flex items-center gap-2 group flex-shrink-0">
            <Logo size={28} priority />
            <span className="font-bold text-[#e0eaff] text-sm group-hover:text-blue-400 transition-colors tracking-wide">LooPR</span>
          </Link>

          {repoName && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-blue-800/50 flex-shrink-0">/</span>
              <span className="text-xs text-[#6b80a8] font-mono truncate max-w-[160px] md:max-w-[260px]">{repoName}</span>
            </div>
          )}

          {pathname !== "/dashboard" && !pathname.includes("/dashboard?demo=true") && (
            <button
              onClick={() => router.back()}
              className="ml-1 flex items-center justify-center w-6 h-6 rounded bg-blue-500/5 hover:bg-blue-500/20 text-blue-400 transition-colors border border-transparent hover:border-blue-500/30"
              title="Go Back"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {isDemo && (
            <span className="px-2 py-0.5 rounded-md text-xs font-mono flex-shrink-0"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.30)", color: "#f59e0b" }}>
              DEMO
            </span>
          )}
        </div>

        {/* ── Sub-nav tabs ── */}
        {baseUrl && (
          <div className="hidden md:flex items-center gap-1 mx-4">
            {[
              { href: baseUrl, label: "Overview" },
              { href: `${baseUrl}/contracts`, label: "Contracts" },
              { href: `${baseUrl}/pull-requests`, label: "Pull Requests" },
            ].map((tab) => {
              const active = isActive(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium"
                  style={
                    active
                      ? {
                          background: "rgba(43,127,255,0.14)",
                          border: "1px solid rgba(43,127,255,0.32)",
                          color: "#93c5fd",
                          boxShadow: "0 0 10px rgba(43,127,255,0.12)",
                        }
                      : {
                          background: "transparent",
                          border: "1px solid transparent",
                          color: "#6b80a8",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!active) (e.currentTarget as HTMLElement).style.color = "#e0eaff";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) (e.currentTarget as HTMLElement).style.color = "#6b80a8";
                  }}
                >
                  <span style={{ color: active ? "#60a5fa" : "#6b80a8" }}>{TAB_ICONS[tab.label]}</span>
                  {tab.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* ── User / Exit ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isDemo ? (
            <Link href="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#6b80a8] hover:text-blue-400 hover:bg-blue-500/8 transition-colors"
              style={{ border: "1px solid transparent" }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Exit demo
            </Link>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => { setMenuOpen(!menuOpen); setConfirmSignOut(false); }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all group"
                style={menuOpen
                  ? { background: "rgba(43,127,255,0.12)", border: "1px solid rgba(43,127,255,0.30)" }
                  : { background: "transparent", border: "1px solid transparent" }}
                onMouseEnter={(e) => { if (!menuOpen) (e.currentTarget as HTMLElement).style.background = "rgba(43,127,255,0.08)"; }}
                onMouseLeave={(e) => { if (!menuOpen) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                {session?.user?.image ? (
                  <img src={session.user.image} alt={githubLogin}
                    className="w-6 h-6 rounded-full flex-shrink-0"
                    style={{ border: "1px solid rgba(43,127,255,0.45)" }} />
                ) : (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(43,127,255,0.20)", border: "1px solid rgba(43,127,255,0.40)" }}>
                    <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <span className="text-xs font-mono text-[#6b80a8] group-hover:text-[#e0eaff] transition-colors hidden sm:inline">
                  @{githubLogin}
                </span>
                <svg
                  className="w-3 h-3 text-[#6b80a8] transition-transform"
                  style={{ transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(3,6,18,0.96)",
                    backdropFilter: "blur(24px) saturate(180%)",
                    border: "1px solid rgba(43,127,255,0.18)",
                    boxShadow: "0 20px 60px rgba(0,0,20,0.7), 0 0 0 1px rgba(43,127,255,0.06)",
                  }}
                >
                  {/* Avatar header */}
                  <div className="px-4 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(43,127,255,0.10)" }}>
                    <div className="flex items-center gap-3">
                      {session?.user?.image ? (
                        <img src={session.user.image} alt={githubLogin}
                          className="w-9 h-9 rounded-full flex-shrink-0"
                          style={{ border: "1px solid rgba(43,127,255,0.40)" }} />
                      ) : (
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(43,127,255,0.15)", border: "1px solid rgba(43,127,255,0.35)" }}>
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#e0eaff] truncate">@{githubLogin}</div>
                        {session?.user?.email && (
                          <div className="text-xs text-[#6b80a8] truncate mt-0.5">{session.user.email}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1.5">
                    <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs text-[#6b80a8] hover:text-[#e0eaff] hover:bg-white/4 transition-colors">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>
                  </div>

                  {/* Sign out */}
                  <div style={{ borderTop: "1px solid rgba(43,127,255,0.10)" }} className="py-1.5">
                    {!confirmSignOut ? (
                      <button
                        onClick={() => setConfirmSignOut(true)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[#6b80a8] hover:text-[#f87171] hover:bg-red-500/6 transition-colors"
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    ) : (
                      <div className="px-4 pt-2 pb-3">
                        {/* Confirmation panel */}
                        <div className="rounded-xl p-3 mb-3"
                          style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.20)" }}>
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-xs font-semibold text-[#f87171]">Sign out?</span>
                          </div>
                          <p className="text-xs text-[#6b80a8] leading-relaxed">
                            You&apos;ll be signed out of LooPR and redirected to the homepage.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                            style={{ background: "linear-gradient(135deg,rgba(244,63,94,0.85),rgba(220,38,38,0.85))", border: "1px solid rgba(244,63,94,0.50)" }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                            </svg>
                            Sign out
                          </button>
                          <button
                            onClick={() => setConfirmSignOut(false)}
                            className="flex-1 py-2 rounded-xl text-xs font-medium text-[#6b80a8] hover:text-[#e0eaff] transition-colors"
                            style={{ background: "rgba(43,127,255,0.08)", border: "1px solid rgba(43,127,255,0.18)" }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
