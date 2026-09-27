import Link from "next/link";
import { signIn } from "@/lib/auth";
import { GlassShell } from "@/components/GlassShell";
import { AsciiStream } from "@/components/AsciiStream";

export default function LoginPage() {
  return (
    <GlassShell>
      <main className="min-h-screen flex flex-col items-center justify-center px-4">

        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center glow-blue animate-pulse-ring"
            style={{
              background: "linear-gradient(135deg, #1e5adc 0%, #0a2fa8 100%)",
              border: "1px solid rgba(60,120,255,0.5)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7 C2 4.2 4.2 2 7 2 C9.8 2 12 4.2 12 7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 7 C12 9.8 9.8 12 7 12" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round"/><circle cx="7" cy="12" r="1.2" fill="white"/><path d="M10.5 5.5 L12 7 L13.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className="font-semibold text-[#e0eaff] tracking-wide">LooPR</span>
        </div>

        {/* Card */}
        <div className="glass w-full max-w-sm p-8 glow-blue-sm">
          <div className="text-xs font-mono text-blue-500/60 mb-4">// authenticate</div>
          <h1 className="text-xl font-bold text-[#e0eaff] mb-1">Sign in</h1>
          <p className="text-xs text-[#6b80a8] mb-2">
            Connect your GitHub account to get started.
          </p>
          <div className="mb-5">
            <AsciiStream />
          </div>

          <div className="space-y-3">
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/dashboard" });
              }}
            >
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-white font-semibold"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                Continue with GitHub
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="glass-divider flex-1" />
              <span className="text-[#6b80a8] text-xs font-mono">or</span>
              <div className="glass-divider flex-1" />
            </div>

            <Link
              href="/dashboard?demo=true"
              className="btn-glass w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm"
            >
              Try Demo Repository
            </Link>
          </div>
        </div>

        <Link href="/" className="mt-6 text-xs text-[#6b80a8] hover:text-blue-400 transition-colors font-mono">
          ← Back
        </Link>
      </main>
    </GlassShell>
  );
}
