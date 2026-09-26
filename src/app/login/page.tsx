import Link from "next/link";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0d1117]">
      <div className="mb-8 flex items-center gap-2">
        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">IL</span>
        </div>
        <span className="font-semibold text-[#e6edf3]">Bob IntentLoop</span>
      </div>

      <div className="w-full max-w-sm p-8 rounded-xl border border-[#30363d] bg-[#161b22]">
        <h1 className="text-xl font-bold text-[#e6edf3] mb-2">Sign in</h1>
        <p className="text-sm text-[#8b949e] mb-6">
          Connect your GitHub account to get started.
        </p>

        <div className="space-y-3">
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Continue with GitHub
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#30363d]" />
            <span className="text-[#8b949e] text-sm">or</span>
            <div className="flex-1 h-px bg-[#30363d]" />
          </div>

          <Link
            href="/dashboard?demo=true"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[#30363d] hover:border-[#58a6ff] text-[#8b949e] hover:text-[#58a6ff] font-medium transition-colors"
          >
            Try Demo Repository
          </Link>
        </div>
      </div>

      <Link href="/" className="mt-6 text-sm text-[#8b949e] hover:text-[#58a6ff]">
        ← Back
      </Link>
    </main>
  );
}
