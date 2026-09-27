"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface NavProps {
  repoName?: string;
  repoId?: string;
  isDemo?: boolean;
}

export function AppNav({ repoName, repoId, isDemo }: NavProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const githubLogin =
    (session?.user as { githubLogin?: string })?.githubLogin ??
    session?.user?.name ??
    "Demo";

  const baseUrl = isDemo
    ? `/demo/repositories/${repoId ?? "demo-ecommerce"}`
    : repoId
    ? `/repositories/${repoId}`
    : null;

  // Close menu on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
        setConfirmSignOut(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Check active tab — treat overview as active when on exact base url
  function isActive(href: string) {
    if (href === baseUrl) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <nav className="glass-nav sticky top-0 z-50 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link
            href={isDemo ? "/dashboard?demo=true" : "/dashboard"}
            className="flex items-center gap-2 group"
          >
            {/* LooPR logomark */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #1e5adc 0%, #0a2fa8 100%)",
                border: "1px solid rgba(60,120,255,0.4)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7 C2 4.2 4.2 2 7 2 C9.8 2 12 4.2 12 7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M12 7 C12 9.8 9.8 12 7 12" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="7" cy="12" r="1.2" fill="white"/>
                <path d="M10.5 5.5 L12 7 L13.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-[#e0eaff] text-sm group-hover:text-blue-400 transition-colors tracking-wide">
              LooPR
            </span>
          </Link>

          {repoName && (
            <>
              <span className="text-blue-900/60">/</span>
              <span className="text-sm text-[#6b80a8] font-mono truncate max-w-[200px]">{repoName}</span>
            </>
          )}

          {isDemo && (
            <span
              className="px-2 py-0.5 rounded-md text-xs font-mono"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.30)", color: "#f59e0b" }}
            >
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
                className={`px-3 py-1.5 rounded-lg transition-colors font-mono text-xs ${
                  isActive(item.href)
                    ? "text-blue-400"
                    : "text-[#6b80a8] hover:text-[#e0eaff]"
                }`}
                style={
                  isActive(item.href)
                    ? { background: "rgba(43,127,255,0.12)", border: "1px solid rgba(43,127,255,0.25)" }
                    : undefined
                }
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* User area */}
        <div className="flex items-center gap-3">
          {isDemo ? (
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-[#6b80a8] hover:text-blue-400 transition-colors px-2 py-1 rounded-lg hover:bg-blue-500/10"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Exit demo
            </Link>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setConfirmSignOut(false); }}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-colors group"
              >
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={githubLogin}
                    className="w-6 h-6 rounded-full flex-shrink-0"
                    style={{ border: "1px solid rgba(43,127,255,0.40)" }}
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(43,127,255,0.20)", border: "1px solid rgba(43,127,255,0.35)" }}>
                    <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <span className="text-xs text-[#6b80a8] font-mono group-hover:text-[#e0eaff] transition-colors hidden sm:inline">@{githubLogin}</span>
                <svg className="w-3 h-3 text-[#6b80a8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden"
                  style={{
                    background: "rgba(5,8,20,0.95)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(43,127,255,0.20)",
                    boxShadow: "0 16px 40px rgba(0,0,20,0.6), 0 0 0 1px rgba(43,127,255,0.08)",
                  }}
                >
                  {/* Profile header */}
                  <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(43,127,255,0.12)" }}>
                    <div className="text-xs text-[#e0eaff] font-semibold">@{githubLogin}</div>
                    {session?.user?.email && (
                      <div className="text-xs text-[#6b80a8] mt-0.5 truncate">{session.user.email}</div>
                    )}
                  </div>

                  {/* Links */}
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#6b80a8] hover:text-[#e0eaff] hover:bg-blue-500/8 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>
                  </div>

                  {/* Sign out section */}
                  <div style={{ borderTop: "1px solid rgba(43,127,255,0.12)" }} className="py-1">
                    {!confirmSignOut ? (
                      <button
                        onClick={() => setConfirmSignOut(true)}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#6b80a8] hover:text-[#f43f5e] hover:bg-red-500/8 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    ) : (
                      <div className="px-4 py-2">
                        <p className="text-xs text-[#6b80a8] mb-2">Sign out of LooPR?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex-1 py-1 rounded-lg text-xs text-white font-medium transition-colors"
                            style={{ background: "rgba(244,63,94,0.25)", border: "1px solid rgba(244,63,94,0.40)" }}
                          >
                            Sign out
                          </button>
                          <button
                            onClick={() => setConfirmSignOut(false)}
                            className="flex-1 py-1 rounded-lg text-xs text-[#6b80a8] transition-colors"
                            style={{ background: "rgba(43,127,255,0.08)", border: "1px solid rgba(43,127,255,0.20)" }}
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
