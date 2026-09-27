"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { getUserRepos } from "@/lib/github/octokit";

type Repo = Awaited<ReturnType<typeof getUserRepos>>[number];

type Filter = "all" | "public" | "private" | "fork";

export function RepoList({ repos }: { repos: Repo[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    return repos.filter((r) => {
      const matchesQuery =
        !query ||
        r.full_name.toLowerCase().includes(query.toLowerCase()) ||
        (r.description ?? "").toLowerCase().includes(query.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "private" && r.private) ||
        (filter === "public" && !r.private && !r.fork) ||
        (filter === "fork" && r.fork);

      return matchesQuery && matchesFilter;
    });
  }, [repos, query, filter]);

  const filters: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Public", value: "public" },
    { label: "Private", value: "private" },
    { label: "Forks", value: "fork" },
  ];

  return (
    <div>
      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6b80a8]"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search repositories…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs font-mono text-[#e0eaff] placeholder-[#6b80a8] outline-none transition-all"
            style={{
              background: "rgba(10,14,30,0.8)",
              border: "1px solid rgba(43,127,255,0.18)",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "rgba(43,127,255,0.5)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "rgba(43,127,255,0.18)")
            }
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-3 py-2 rounded-xl text-xs font-mono transition-colors"
              style={
                filter === f.value
                  ? {
                      background: "rgba(43,127,255,0.18)",
                      border: "1px solid rgba(43,127,255,0.40)",
                      color: "#7eb8ff",
                    }
                  : {
                      background: "rgba(10,14,30,0.6)",
                      border: "1px solid rgba(43,127,255,0.12)",
                      color: "#6b80a8",
                    }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="glass p-8 text-center">
          <svg className="w-8 h-8 text-[#6b80a8] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-[#6b80a8] font-mono">No repositories match your search.</p>
        </div>
      ) : (
        <div className="glass overflow-hidden">
          {filtered.map((repo, i) => (
            <Link
              key={repo.id}
              href={`/repositories/${repo.owner.login}/${repo.name}`}
              className="flex items-center justify-between p-4 hover:bg-blue-500/5 transition-colors group"
              style={i > 0 ? { borderTop: "1px solid rgba(0,120,255,0.10)" } : undefined}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(0,5,20,0.8)", border: "1px solid rgba(43,127,255,0.20)" }}
                >
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-[#e0eaff] group-hover:text-blue-400 transition-colors text-sm truncate">
                      {repo.full_name}
                    </span>
                    {repo.private && (
                      <span className="px-1.5 py-0.5 rounded text-xs font-mono text-[#6b80a8] flex-shrink-0"
                        style={{ background: "rgba(0,5,20,0.8)", border: "1px solid rgba(0,120,255,0.15)" }}>
                        private
                      </span>
                    )}
                    {repo.fork && (
                      <span className="px-1.5 py-0.5 rounded text-xs font-mono text-[#6b80a8] flex-shrink-0"
                        style={{ background: "rgba(0,5,20,0.8)", border: "1px solid rgba(0,120,255,0.15)" }}>
                        fork
                      </span>
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-xs text-[#6b80a8] truncate mt-0.5">{repo.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {repo.language && (
                      <span className="flex items-center gap-1 text-xs text-[#6b80a8] font-mono">
                        <span className="w-2 h-2 rounded-full bg-blue-400/60 inline-block" />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-[#6b80a8]">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      {repo.stargazers_count}
                    </span>
                    <span className="text-xs text-[#6b80a8]">
                      Updated {new Date(repo.updated_at ?? "").toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <svg className="w-4 h-4 text-[#6b80a8] group-hover:text-blue-400 transition-colors flex-shrink-0 ml-3"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}

      {/* Count */}
      {query || filter !== "all" ? (
        <p className="text-xs text-[#6b80a8] font-mono mt-3">
          {filtered.length} of {repos.length} repositories
        </p>
      ) : null}
    </div>
  );
}
