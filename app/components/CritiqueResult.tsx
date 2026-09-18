"use client";

import { parseCritique, bulletLines } from "@/app/lib/critique-format";

export default function CritiqueResult({ critique }: { critique: string }) {
  const { score, sections } = parseCritique(critique);

  return (
    <div className="border border-borderline rounded-2xl overflow-hidden">
      {score !== null && (
        <div className="bg-ink px-6 py-5 flex items-center justify-between">
          <span className="text-white font-display font-bold text-lg">Your Critique</span>
          <div className="flex items-baseline gap-1 font-mono font-bold text-2xl text-white">
            <span className="text-coral">{score}</span>
            <span className="text-sm text-slate-300">/100</span>
          </div>
        </div>
      )}

      <div className="p-6 space-y-5 bg-white">
        {sections.map((section) => {
          if (section.title === "OVERALL SCORE") {
            return (
              <p key={section.title} className="text-sm text-subtext leading-relaxed">
                {section.body.replace(/^\d{1,3}\s*(?:\/\s*100)?[.:]?\s*/, "")}
              </p>
            );
          }

          if (section.title === "STRENGTHS") {
            return (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-success uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  Strengths
                </h3>
                <ul className="space-y-1.5">
                  {bulletLines(section.body).map((line, i) => (
                    <li key={i} className="text-sm text-maintext flex items-start gap-2">
                      <span className="text-success shrink-0">✓</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          if (section.title === "WEAKNESSES" || section.title === "MINOR REFINEMENTS") {
            return (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-amber uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber"></span>
                  {section.title === "WEAKNESSES" ? "Weaknesses" : "Minor Refinements"}
                </h3>
                <ul className="space-y-1.5">
                  {bulletLines(section.body).map((line, i) => (
                    <li key={i} className="text-sm text-maintext flex items-start gap-2">
                      <span className="text-amber shrink-0">!</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          if (section.title === "NEXT STEPS") {
            return (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-ink uppercase tracking-wide mb-2">
                  Next Steps
                </h3>
                <ol className="space-y-2">
                  {bulletLines(section.body).map((line, i) => (
                    <li key={i} className="text-sm text-maintext flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-ink text-white font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        {i + 1}
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ol>
              </div>
            );
          }

          if (section.title === "FINAL VERDICT") {
            return (
              <div key={section.title} className="p-4 bg-canvas border border-borderline rounded-xl">
                <h3 className="text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                  Final Verdict
                </h3>
                <p className="text-sm text-maintext leading-relaxed">{section.body}</p>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}