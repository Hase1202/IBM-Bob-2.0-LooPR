import Link from "next/link";
import { DEMO_PR } from "@/lib/demo/data";

export default function PullRequestsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <nav className="border-b border-[#30363d] bg-[#161b22] px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3 text-sm">
            <Link href="/demo/repositories/demo-ecommerce" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">IL</span>
              </div>
              <span className="font-semibold text-[#e6edf3]">IntentLoop</span>
            </Link>
            <span className="text-[#30363d]">/</span>
            <Link href="/demo/repositories/demo-ecommerce" className="text-[#8b949e] hover:text-[#58a6ff]">ecommerce-platform</Link>
            <span className="text-[#30363d]">/</span>
            <span className="text-[#e6edf3]">Pull Requests</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-900/50 text-yellow-400 border border-yellow-800/50">DEMO</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#e6edf3] mb-6">Pull Requests</h1>

        <div className="border border-[#30363d] rounded-lg bg-[#161b22] overflow-hidden">
          <div className="p-5">
            {/* PR Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-[#238636] flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                  </span>
                  <span className="text-[#8b949e] text-sm">#{DEMO_PR.number}</span>
                </div>
                <h2 className="text-lg font-semibold text-[#e6edf3]">{DEMO_PR.title}</h2>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-mono border text-[#238636] border-[#238636]/40 bg-green-900/20">OPEN</span>
            </div>

            {/* PR Meta */}
            <div className="flex items-center gap-6 text-sm text-[#8b949e] mb-4">
              <span>{DEMO_PR.filesChanged} files changed</span>
              <span className="text-[#3fb950]">+{DEMO_PR.additions}</span>
              <span className="text-[#f85149]">-{DEMO_PR.deletions}</span>
            </div>

            {/* Files */}
            <div className="mb-5 p-3 rounded bg-[#0d1117] border border-[#30363d]">
              <div className="text-xs text-[#8b949e] mb-2 uppercase tracking-wider">Changed Files</div>
              <ul className="space-y-1">
                {DEMO_PR.files.map((f) => (
                  <li key={f.path} className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#58a6ff]">{f.path}</span>
                    <span className="text-[#8b949e]">
                      <span className="text-[#3fb950]">+{f.additions}</span>
                      {" "}<span className="text-[#f85149]">-{f.deletions}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contract link */}
            <div className="flex items-center justify-between p-3 rounded border border-[#58a6ff]/30 bg-blue-900/10 mb-5">
              <div>
                <div className="text-xs text-[#8b949e] mb-0.5">Architectural Contract</div>
                <Link
                  href="/demo/repositories/demo-ecommerce/contracts/currency-cache"
                  className="text-sm text-[#58a6ff] hover:underline"
                >
                  Currency Rate Caching
                </Link>
              </div>
              <span className="text-xs text-[#58a6ff]">● ACTIVE</span>
            </div>

            {/* CTA */}
            <Link
              href="/demo/repositories/demo-ecommerce/pull-requests/142/review"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#1f6feb] hover:bg-[#388bfd]/80 text-white font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Review With Bob
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
