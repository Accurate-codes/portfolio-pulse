import Link from "next/link";
import { Show, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="bg-canvas text-maintext font-sans antialiased min-h-screen flex flex-col selection:bg-coral/20 selection:text-coral">

      {/* Public Navigation */}
      <header className="w-full bg-white border-b border-borderline sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <a href="#hero" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-ink flex items-center justify-center p-1.5 shadow-sm">
                <svg viewBox="0 0 32 32" fill="none" className="w-full h-full stroke-coral stroke-[2.5]">
                  <path d="M4 16h6l3-8 5 16 4-11 3 5 4-2h3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-ink">
                Portfolio<span className="text-coral">Pulse</span>
              </span>
            </a>
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-subtext">
              <a href="#how-it-works" className="hover:text-ink transition-colors">How It Works</a>
              <a href="#design-critique" className="hover:text-ink transition-colors flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-design-accent"></span> Design Critique
              </a>
              <a href="#dev-critique" className="hover:text-ink transition-colors flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-dev-accent"></span> Development Critique
              </a>
              <a href="#sample-report" className="hover:text-ink transition-colors">Sample Report</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="hidden sm:inline-flex text-sm font-semibold text-subtext hover:text-ink px-3 py-2 transition-colors cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="bg-coral hover:bg-[#ff4356] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer">
                  <span>Try It Free</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link
                href="/select-track"
                className="bg-coral hover:bg-[#ff4356] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <span>Go to Dashboard</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </Show>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 border-b border-borderline bg-gradient-to-b from-white to-canvas">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 flex flex-col items-start pr-0 lg:pr-6">
              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-ink tracking-tight leading-[1.1] mb-6">
                Know what to fix <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-ink via-ink to-coral">before they see it.</span>
              </h1>
              <p className="text-subtext text-lg sm:text-xl font-normal leading-relaxed mb-8 max-w-2xl">
                Upload your design or code and receive an objective, professionally structured critique covering overall score, benchmark comparison, strengths, weaknesses, and prioritized next steps.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-6">
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button className="bg-coral hover:bg-[#ff4356] text-white px-7 py-4 rounded-xl font-bold text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-center cursor-pointer">
                      <span>Critique my work</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </SignInButton>
                </Show>
                <Show when="signed-in">
                  <Link
                    href="/select-track"
                    className="bg-coral hover:bg-[#ff4356] text-white px-7 py-4 rounded-xl font-bold text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-center"
                  >
                    <span>Critique my work</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </Show>
                <a href="#sample-report" className="bg-white hover:bg-canvas border border-borderline text-ink px-6 py-4 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 text-center shadow-sm">
                  <span>View sample report</span>
                  <svg className="w-4 h-4 text-subtext" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
              </div>
              <div className="flex items-center gap-6 text-xs text-subtext font-medium">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  3 free critiques included
                </span>
                <span>•</span>
                <span>No credit card required</span>
                <span>•</span>
                <span>Design &amp; Code support</span>
              </div>
            </div>

            {/* Right Hero Preview: Structured Critique Card */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-coral/20 to-dev-accent/20 rounded-2xl blur-lg -z-10 opacity-70"></div>
              <div className="bg-white border border-borderline rounded-2xl shadow-xl overflow-hidden relative">
                <div className="scan-line absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-coral to-transparent z-20 pointer-events-none opacity-80"></div>

                <div className="px-5 py-4 bg-ink border-b border-borderline flex items-center justify-between text-white">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
                    <span className="font-mono text-xs text-slate-300">REPORT // #PP-8492</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-design-accent/20 text-pink-300 border border-design-accent/30 font-semibold">Design Track</span>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h2 className="font-display font-bold text-lg text-ink">Northstar Analytics Dashboard</h2>
                      <p className="text-xs text-subtext mt-0.5">Evaluated against SaaS Tier-1 Standards</p>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-baseline gap-1 font-mono font-bold text-2xl text-ink">
                        <span className="text-coral">82</span><span className="text-sm text-subtext">/100</span>
                      </div>
                      <div className="text-[11px] font-semibold text-success uppercase tracking-wider">Strong Foundation</div>
                    </div>
                  </div>

                  <div className="space-y-3.5 mb-6">
                    <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-emerald-950 uppercase tracking-wide block mb-0.5">Strength</span>
                        <p className="text-xs text-emerald-900 leading-snug">Consistent 8px spacing rhythm makes the visual hierarchy predictable and polished.</p>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-amber-950 uppercase tracking-wide block mb-0.5">Weakness</span>
                        <p className="text-xs text-amber-900 leading-snug">Secondary button borders compete with the primary checkout CTA for visual priority.</p>
                      </div>
                    </div>

                    <div className="p-3 bg-canvas border border-borderline rounded-xl flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-ink text-white font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">1</span>
                      <div>
                        <span className="text-xs font-semibold text-ink uppercase tracking-wide block mb-0.5">Priority Action</span>
                        <p className="text-xs text-subtext leading-snug">Adjust muted button stroke from 1.5px to 1px neutral #E4E7EC to anchor eye-flow.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-borderline flex items-center justify-between text-xs text-subtext">
                    <span className="font-mono">5 criteria verified</span>
                    <span className="text-coral font-medium flex items-center gap-1">
                      Full 4-page report available
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-b border-borderline">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-xs font-bold text-coral uppercase tracking-wider">Methodology</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink mt-2 mb-4">How Portfolio Pulse Works</h2>
            <p className="text-subtext text-base">A disciplined three-phase diagnostic pipeline built for creative professionals preparing to present work to senior stakeholders.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-8 rounded-2xl bg-canvas border border-borderline relative flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-ink text-white font-mono font-bold text-lg flex items-center justify-center mb-6 shadow-sm">01</div>
                <h3 className="font-display font-bold text-xl text-ink mb-3">Submit your work</h3>
                <p className="text-subtext text-sm leading-relaxed mb-6">
                  Upload high-res screens (PNG, JPG, PDF) or paste a public Figma link for design. Connect a GitHub repository or paste code for development.
                </p>
              </div>
              <div className="pt-4 border-t border-borderline text-xs font-mono text-ink flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-coral"></span>
                <span>Direct file ingestion</span>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-canvas border border-borderline relative flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-coral text-white font-mono font-bold text-lg flex items-center justify-center mb-6 shadow-sm">02</div>
                <h3 className="font-display font-bold text-xl text-ink mb-3">Diagnostic scan</h3>
                <p className="text-subtext text-sm leading-relaxed mb-6">
                  Our model parses layout hierarchy, typography contrast, accessibility standards, code smell, and design system continuity against current industry standards.
                </p>
              </div>
              <div className="pt-4 border-t border-borderline text-xs font-mono text-ink flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-coral"></span>
                <span>WCAG AA &amp; benchmark scan</span>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-canvas border border-borderline relative flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-ink text-white font-mono font-bold text-lg flex items-center justify-center mb-6 shadow-sm">03</div>
                <h3 className="font-display font-bold text-xl text-ink mb-3">Actionable critique</h3>
                <p className="text-subtext text-sm leading-relaxed mb-6">
                  Receive a scored, publication-ready report. Get specific strengths, targeted fixes, and a clear sequence of next steps before exporting as an executive PDF.
                </p>
              </div>
              <div className="pt-4 border-t border-borderline text-xs font-mono text-ink flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-coral"></span>
                <span>Exportable PDF delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Critique Tracks Section */}
      <section id="critique-tracks" className="py-20 bg-canvas border-b border-borderline">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-xs font-bold text-coral uppercase tracking-wider">Two Tailored Tracks</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink mt-2 mb-4">Engineered for your exact discipline</h2>
            <p className="text-subtext text-base">Select your specialized evaluation pipeline with tailored rubrics and criteria.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Design Track Card */}
            <div id="design-critique" className="bg-white border-2 border-design-accent/30 hover:border-design-accent rounded-2xl p-8 transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-pink-50 text-design-accent border border-pink-200">TRACK 01</span>
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-design-accent flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="font-display font-bold text-2xl text-ink mb-2">Design Critique</h3>
                <p className="text-subtext text-sm mb-6 leading-relaxed">
                  Upload an image, PDF, design snapshot, or paste a Figma prototype link. Evaluates visual hierarchy, typography, color harmony, accessibility, and multi-screen continuity.
                </p>
                <div className="space-y-2.5 mb-8">
                  {["Visual hierarchy and eye flow", "Typography, scale, and color harmony", "WCAG AA accessibility contrast compliance", "Modern design pattern alignment"].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-maintext">
                      <svg className="w-4 h-4 text-design-accent shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="w-full py-3.5 px-4 rounded-xl bg-ink text-white font-semibold text-sm hover:bg-navy transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <span>Review a design</span>
                    <svg className="w-4 h-4 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <Link href="/select-track" className="w-full py-3.5 px-4 rounded-xl bg-ink text-white font-semibold text-sm hover:bg-navy transition-colors flex items-center justify-center gap-2">
                  <span>Review a design</span>
                  <svg className="w-4 h-4 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </Show>
            </div>

            {/* Dev Track Card */}
            <div id="dev-critique" className="bg-white border-2 border-dev-accent/30 hover:border-dev-accent rounded-2xl p-8 transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-50 text-dev-accent border border-sky-200">TRACK 02</span>
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-dev-accent flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                </div>
                <h3 className="font-display font-bold text-2xl text-ink mb-2">Development Critique</h3>
                <p className="text-subtext text-sm mb-6 leading-relaxed">
                  Paste a GitHub repository link or code snippet. Evaluates module architecture, naming hygiene, readability, common anti-patterns, security smells, and documentation.
                </p>
                <div className="space-y-2.5 mb-8">
                  {["Code architecture and modularity", "Clean naming and self-documenting code", "Anti-pattern and side-effect detection", "Performance bottlenecks & security posture"].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-maintext">
                      <svg className="w-4 h-4 text-dev-accent shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="w-full py-3.5 px-4 rounded-xl bg-ink text-white font-semibold text-sm hover:bg-navy transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <span>Review code</span>
                    <svg className="w-4 h-4 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <Link href="/select-track" className="w-full py-3.5 px-4 rounded-xl bg-ink text-white font-semibold text-sm hover:bg-navy transition-colors flex items-center justify-center gap-2">
                  <span>Review code</span>
                  <svg className="w-4 h-4 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </Show>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Report Preview Section */}
      <section id="sample-report" className="py-20 bg-white border-b border-borderline">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-xs font-bold text-coral uppercase tracking-wider">Uncompromising Clarity</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink mt-2 mb-4">Sample Critique Dossier</h2>
            <p className="text-subtext text-base">Here is what a complete diagnostic evaluation looks like. Action-driven, calibrated, and designed for immediate execution.</p>
          </div>

          <div className="bg-canvas border border-borderline rounded-2xl p-6 lg:p-10 shadow-sm max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-borderline gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-0.5 rounded font-mono text-xs bg-design-accent/15 text-design-accent font-semibold border border-design-accent/20 uppercase">Design Track</span>
                  <span className="text-xs text-subtext font-mono">Completed Oct 24, 2025</span>
                </div>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-ink">Lumina Health Patient Portal</h3>
                <p className="text-sm text-subtext mt-1">Target Audience: Non-technical adult patients accessing critical lab metrics.</p>
              </div>
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-borderline shrink-0">
                <div className="w-14 h-14 rounded-full border-4 border-coral flex items-center justify-center font-mono font-bold text-xl text-ink">86</div>
                <div>
                  <div className="text-xs font-mono text-subtext uppercase">Overall Score</div>
                  <div className="font-display font-bold text-sm text-success">Strong Foundation</div>
                  <div className="text-[11px] text-subtext">Tier: Presentation Ready Soon</div>
                </div>
              </div>
            </div>

            <div className="my-8 p-5 bg-white border-l-4 border-coral rounded-r-xl border-t border-r border-b border-borderline">
              <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold text-ink uppercase">
                <svg className="w-4 h-4 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Industry Benchmark Analysis
              </div>
              <p className="text-sm text-maintext leading-relaxed">
                Compared with current healthcare and wellness SaaS conventions, this design demonstrates exemplary structural discipline. Typography scale and table accessibility exceed typical junior portfolios. The primary area for refinement is card contrast for secondary alert badges, which currently fall below WCAG AAA levels in low-light environments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-borderline">
                <h4 className="font-display font-bold text-base text-ink mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
                  Key Strengths (3 identified)
                </h4>
                <ul className="space-y-3.5 text-sm text-maintext">
                  <li className="flex items-start gap-2.5">
                    <span className="text-success font-bold shrink-0">✓</span>
                    <span><strong>Consistent 8px grid rhythm:</strong> Table cell padding and section margins align predictably across all breakpoint tests.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-success font-bold shrink-0">✓</span>
                    <span><strong>Primary Action Hierarchy:</strong> The &quot;Request Refill&quot; CTA retains unmistakable prominence across every screen state.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-success font-bold shrink-0">✓</span>
                    <span><strong>Semantic Color Discipline:</strong> Status indicators for normal vs. elevated blood test flags avoid relying purely on hue.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl border border-borderline">
                <h4 className="font-display font-bold text-base text-ink mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber"></span>
                  Fixable Weaknesses (2 identified)
                </h4>
                <ul className="space-y-3.5 text-sm text-maintext">
                  <li className="flex items-start gap-2.5">
                    <span className="text-amber font-bold shrink-0">!</span>
                    <span><strong>Subtle Body Contrast:</strong> Secondary helper text in grey-400 (#9CA3AF) fails 4.5:1 ratio against #F8FAFC card backgrounds.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-amber font-bold shrink-0">!</span>
                    <span><strong>Dense Mobile Table:</strong> Medical history column headers cause unintentional horizontal drift on screens below 380px width.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-borderline">
              <h4 className="font-display font-bold text-base text-ink mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-ink text-white font-mono text-xs flex items-center justify-center font-bold">#</span>
                Prioritized Next Steps
              </h4>
              <div className="space-y-3">
                <div className="p-3.5 bg-canvas rounded-lg flex items-start gap-3 border border-borderline">
                  <span className="w-6 h-6 rounded-full bg-ink text-white font-mono text-xs flex items-center justify-center shrink-0 font-bold">1</span>
                  <div>
                    <span className="text-sm font-semibold text-ink">Upgrade body text contrast token</span>
                    <p className="text-xs text-subtext mt-0.5">Change muted text from #9CA3AF to #667085 across all cards to achieve full WCAG AA certification.</p>
                  </div>
                </div>
                <div className="p-3.5 bg-canvas rounded-lg flex items-start gap-3 border border-borderline">
                  <span className="w-6 h-6 rounded-full bg-ink text-white font-mono text-xs flex items-center justify-center shrink-0 font-bold">2</span>
                  <div>
                    <span className="text-sm font-semibold text-ink">Convert mobile table to stacked cards</span>
                    <p className="text-xs text-subtext mt-0.5">Eliminate horizontal scrolling by restructuring the 4-column record table into individual card blocks under 640px.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-ink text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-display font-bold text-3xl sm:text-5xl tracking-tight mb-6">
            Make your next submission <br />
            <span className="text-coral">your strongest one.</span>
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of designers and developers preflighting their portfolios, case studies, and repositories before showing them to employers.
          </p>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="bg-coral hover:bg-[#ff4356] text-white px-8 py-4 rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2 cursor-pointer">
                <span>Get my free critique</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Link href="/select-track" className="bg-coral hover:bg-[#ff4356] text-white px-8 py-4 rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2">
              <span>Get my free critique</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </Show>
          <p className="text-xs text-slate-400 mt-4 font-mono">No credit card • 3 free critiques • Instant report</p>
        </div>
      </section>

      {/* Public Footer */}
      <footer className="bg-navy text-slate-400 text-sm py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-coral/20 flex items-center justify-center">
              <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5 stroke-coral stroke-[2.5]">
                <path d="M4 16h6l3-8 5 16 4-11 3 5 4-2h3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-display font-bold text-white tracking-tight">PortfolioPulse</span>
            <span className="text-xs text-slate-500 font-mono">© 2026 All rights reserved</span>
          </div>
          <div className="flex items-center gap-8 text-xs font-medium">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#design-critique" className="hover:text-white transition-colors">Design Critique</a>
            <a href="#dev-critique" className="hover:text-white transition-colors">Development Critique</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  );
}