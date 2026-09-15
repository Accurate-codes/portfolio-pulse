import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function SelectTrack() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="w-full bg-white border-b border-borderline">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-ink flex items-center justify-center p-1.5 shadow-sm">
              <svg viewBox="0 0 32 32" fill="none" className="w-full h-full stroke-coral stroke-[2.5]">
                <path d="M4 16h6l3-8 5 16 4-11 3 5 4-2h3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-ink">
              Portfolio<span className="text-coral">Pulse</span>
            </span>
          </Link>
            <UserButton />
        </div>
      </header>

      {/* Track Selection */}
      <div className="flex items-center justify-center px-6 py-20">
        <div className="max-w-3xl w-full text-center">
          <span className="font-mono text-xs font-bold text-coral uppercase tracking-wider">Step 1 of 2</span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink mt-2 mb-3">
            What are you submitting today?
          </h1>
          <p className="text-subtext text-base mb-12">
            Pick the track that matches your work — this decides which rubric your critique is scored against.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Design Track */}
            <Link
              href="/upload/design"
              className="group bg-white border-2 border-design-accent/30 hover:border-design-accent rounded-2xl p-8 transition-all shadow-sm hover:shadow-md text-left flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-pink-50 text-design-accent flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="font-display font-bold text-xl text-ink mb-2">I&apos;m a Designer</h2>
              <p className="text-subtext text-sm leading-relaxed">
                Upload an image, PDF, or paste a Figma link. Get feedback on hierarchy, typography, color, and accessibility.
              </p>
            </Link>

            {/* Dev Track */}
            <Link
              href="/upload/dev"
              className="group bg-white border-2 border-dev-accent/30 hover:border-dev-accent rounded-2xl p-8 transition-all shadow-sm hover:shadow-md text-left flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-dev-accent flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h2 className="font-display font-bold text-xl text-ink mb-2">I&apos;m a Developer</h2>
              <p className="text-subtext text-sm leading-relaxed">
                Paste a GitHub repo link or code snippet. Get feedback on architecture, naming, and anti-patterns.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}