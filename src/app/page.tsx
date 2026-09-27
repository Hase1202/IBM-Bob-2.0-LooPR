import Link from "next/link";
import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GlassShell } from "@/components/GlassShell";
import { AsciiStream } from "@/components/AsciiStream";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <GlassShell>
      <main className="min-h-screen flex flex-col">

        {/* Top nav bar */}
        <nav className="glass-nav px-6 py-0 flex items-center justify-between h-14 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1e5adc 0%, #0a2fa8 100%)", border: "1px solid rgba(60,120,255,0.4)" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7 C2 4.2 4.2 2 7 2 C9.8 2 12 4.2 12 7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M12 7 C12 9.8 9.8 12 7 12" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="7" cy="12" r="1.2" fill="white"/>
                <path d="M10.5 5.5 L12 7 L13.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-[#e0eaff] text-sm tracking-wide">LooPR</span>
          </div>
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <button type="submit" className="btn-primary flex items-center gap-2 px-4 py-1.5 rounded-lg text-white text-xs font-semibold">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Sign in
            </button>
          </form>
        </nav>

        {/* Hero section */}
        <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center relative">

          {/* Ambient glow blobs */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(30,90,220,0.12) 0%, transparent 70%)" }}
            aria-hidden
          />

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs font-mono"
            style={{ background: "rgba(43,127,255,0.10)", border: "1px solid rgba(43,127,255,0.25)", color: "#7eb8ff" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-ring inline-block" />
            AI-powered PR review for architectural alignment
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tight leading-none">
            <span
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #93c5fd 45%, #2b7fff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Close the loop
            </span>
            <br />
            <span className="text-[#e0eaff]/80 text-5xl md:text-6xl font-bold">on every PR.</span>
          </h1>

          <p className="text-base text-[#6b80a8] max-w-lg mb-10 leading-relaxed">
            Design contracts with Bob. Ship your feature. LooPR reviews every
            pull request against the architecture you originally agreed on —
            catching drift before it ships.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full max-w-sm sm:max-w-none sm:justify-center">
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/dashboard" });
              }}
            >
              <button
                type="submit"
                className="btn-primary flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-white font-bold text-sm w-full sm:w-auto"
              >
                <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                Continue with GitHub
              </button>
            </form>

            <Link
              href="/dashboard?demo=true"
              className="btn-glass flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm w-full sm:w-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View live demo
            </Link>
          </div>

          <p className="text-xs text-[#6b80a8]/60 font-mono mb-20">
            No credit card required · Free to try
          </p>

          {/* Process flow diagram */}
          <div className="w-full max-w-3xl">
            <div className="glass-divider mb-10" />
            <p className="text-xs font-mono text-[#6b80a8] mb-8 uppercase tracking-widest">How it works</p>
            <div className="flex flex-col md:flex-row items-center gap-0 md:gap-0">
              {[
                {
                  step: "01",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ),
                  title: "Define Contract",
                  desc: "Describe your feature intent. Bob generates an architectural contract capturing design decisions.",
                },
                {
                  step: "02",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  ),
                  title: "Build the Feature",
                  desc: "Your team codes normally. Open a pull request when ready.",
                },
                {
                  step: "03",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  ),
                  title: "Review With Bob",
                  desc: "LooPR compares the PR diff against the contract. Drift is surfaced instantly.",
                },
              ].map((step, i) => (
                <div key={step.step} className="flex md:flex-col items-center flex-1 w-full">
                  <div className="glass p-5 text-center md:text-center flex-1 w-full">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: "rgba(43,127,255,0.12)", border: "1px solid rgba(43,127,255,0.25)", color: "#7eb8ff" }}
                    >
                      {step.icon}
                    </div>
                    <div className="text-xs font-mono text-blue-500/50 mb-1">Step {step.step}</div>
                    <h3 className="text-sm font-semibold text-[#e0eaff] mb-2">{step.title}</h3>
                    <p className="text-xs text-[#6b80a8] leading-relaxed">{step.desc}</p>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:flex items-center justify-center w-8 flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature strip */}
        <section className="px-4 pb-20 max-w-5xl mx-auto w-full">
          <div className="glass-divider mb-10" />
          <p className="text-xs font-mono text-[#6b80a8] mb-8 uppercase tracking-widest text-center">Core capabilities</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: "Architectural Contracts",
                desc: "Capture design intent before implementation begins. Contracts act as living specifications.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                title: "Intent Drift Detection",
                desc: "Compare what was agreed with what was built — automatically, on every PR.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Blast Radius Analysis",
                desc: "Find unmodified files that are silently broken by the change.",
              },
            ].map((f) => (
              <div key={f.title} className="glass p-5 animate-float">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: "rgba(43,127,255,0.12)", border: "1px solid rgba(43,127,255,0.22)", color: "#7eb8ff" }}
                >
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[#e0eaff] mb-1.5 text-sm">{f.title}</h3>
                <p className="text-xs text-[#6b80a8] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { value: "100%", label: "Contract coverage" },
              { value: "<2s", label: "Review time" },
              { value: "0", label: "Setup required" },
            ].map((s) => (
              <div key={s.label} className="glass-sm p-4 text-center">
                <div
                  className="text-2xl font-black mb-1"
                  style={{
                    background: "linear-gradient(135deg, #e0eaff 0%, #7eb8ff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {s.value}
                </div>
                <div className="text-xs text-[#6b80a8] font-mono">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="px-4 pb-16 text-center">
          <div className="glass-divider mb-12" />
          <div className="mb-3">
            <AsciiStream />
          </div>
          <p className="text-xs text-[#6b80a8]/50 font-mono">
            LooPR · Keep architecture and implementation aligned.
          </p>
        </section>

      </main>
    </GlassShell>
  );
}
