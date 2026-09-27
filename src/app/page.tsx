import Link from "next/link";
import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GlassShell } from "@/components/GlassShell";
import { AsciiSphere } from "@/components/AsciiSphere";
import { Logo } from "@/components/Logo";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <GlassShell>
      <main className="min-h-screen flex flex-col">

        {/* ── Top nav ── */}
        <nav className="glass-nav px-6 flex items-center justify-between h-14 sticky top-0 z-50">
          <div className="flex items-center gap-2.5">
            <Logo size={28} priority />
            <span className="font-bold text-[#e0eaff] text-sm tracking-wide">LooPR</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard?demo=true" className="text-xs text-[#6b80a8] hover:text-blue-400 transition-colors font-mono hidden sm:inline">
              View demo
            </Link>
            <form action={async () => { "use server"; await signIn("github", { redirectTo: "/dashboard" }); }}>
              <button type="submit" className="btn-primary flex items-center gap-2 px-4 py-1.5 rounded-lg text-white text-xs font-semibold">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                Sign in
              </button>
            </form>
          </div>
        </nav>

        {/* ── Two-column hero ── */}
        <section className="flex-1 flex flex-col lg:flex-row items-center justify-center px-6 lg:px-16 py-12 gap-12 lg:gap-16 max-w-7xl mx-auto w-full">

          {/* LEFT — ASCII Sphere */}
          <div className="flex flex-col items-center justify-center lg:w-1/2 flex-shrink-0">
            <div className="relative flex items-center justify-center">
              {/* Ambient glow only — no box */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: "480px", height: "480px",
                  background: "radial-gradient(ellipse, rgba(30,90,220,0.14) 0%, transparent 68%)",
                }}
                aria-hidden
              />
              <AsciiSphere />
            </div>

            <p className="mt-3 text-xs font-mono text-blue-500/40 tracking-widest uppercase">
              intent · loop · PR
            </p>
          </div>

          {/* RIGHT — CTA content */}
          <div className="lg:w-1/2 flex flex-col items-start text-left max-w-lg">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-mono"
              style={{ background: "rgba(43,127,255,0.10)", border: "1px solid rgba(43,127,255,0.25)", color: "#7eb8ff" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-ring inline-block" />
              AI-powered PR review
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl font-black mb-5 tracking-tight leading-[1.05]">
              <span style={{ background: "linear-gradient(135deg,#fff 0%,#93c5fd 45%,#2b7fff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Close the loop
              </span>
              <br />
              <span className="text-[#e0eaff]/75 text-4xl lg:text-5xl font-bold">on every PR.</span>
            </h1>

            <p className="text-sm text-[#6b80a8] mb-8 leading-relaxed max-w-md">
              Design architectural contracts with LooPR. Ship the feature.
              LooPR reviews every pull request against what you originally agreed
              on — catching drift <span className="text-blue-400/80">before</span> it ships.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 w-full mb-6">
              <form
                action={async () => { "use server"; await signIn("github", { redirectTo: "/dashboard" }); }}
                className="flex-1 sm:flex-none"
              >
                <button type="submit" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-white font-bold text-sm">
                  <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  Continue with GitHub
                </button>
              </form>
              <Link href="/dashboard?demo=true" className="btn-glass flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View live demo
              </Link>
            </div>

            <p className="text-xs text-[#6b80a8]/50 font-mono mb-10">No credit card · Free to try</p>

            {/* Mini feature list */}
            <div className="space-y-2.5 w-full">
              {[
                { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", label: "Architectural contracts" },
                { icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", label: "Intent drift detection on every PR" },
                { icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Blast radius analysis" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(43,127,255,0.12)", border: "1px solid rgba(43,127,255,0.22)" }}
                  >
                    <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} />
                    </svg>
                  </div>
                  <span className="text-xs text-[#6b80a8]">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="px-6 pb-16 max-w-5xl mx-auto w-full">
          <div className="glass-divider mb-10" />
          <p className="text-xs font-mono text-[#6b80a8] mb-8 uppercase tracking-widest text-center">How it works</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: "01", title: "Define Contract",
                desc: "Describe your feature intent. LooPR generates an architectural contract capturing key design decisions.",
                path: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
              },
              {
                step: "02", title: "Build the Feature",
                desc: "Your team codes normally. Open a pull request when ready — nothing changes in your workflow.",
                path: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
              },
              {
                step: "03", title: "Review With LooPR",
                desc: "LooPR compares the PR diff against the contract. Drift is surfaced instantly with file-level detail.",
                path: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
              },
            ].map((s, i) => (
              <div key={s.step} className="glass p-5 relative">
                {i < 2 && (
                  <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <svg className="w-4 h-4 text-blue-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(43,127,255,0.12)", border: "1px solid rgba(43,127,255,0.25)", color: "#7eb8ff" }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.path} />
                    </svg>
                  </div>
                  <span className="text-xs font-mono text-blue-500/40">Step {s.step}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#e0eaff] mb-2">{s.title}</h3>
                <p className="text-xs text-[#6b80a8] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="px-6 pb-10 text-center">
          <div className="glass-divider mb-6" />
          <p className="text-xs text-[#6b80a8]/40 font-mono">
            LooPR · Keep architecture and implementation aligned.
          </p>
        </footer>

      </main>
    </GlassShell>
  );
}
