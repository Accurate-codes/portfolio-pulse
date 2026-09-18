"use client";

import { useEffect, useState } from "react";
import CritiqueResult from "@/app/components/CritiqueResult";

type HistoryItem = {
  id: number;
  track: "design" | "dev";
  title: string;
  score: number | null;
  critique_text: string;
  created_at: string;
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch("/api/history");
        const data = await response.json();
        if (response.ok) {
          setItems(data.critiques);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, []);

  function toggleOpen(id: number) {
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <div className="px-6 py-16 max-w-3xl mx-auto w-full">
      <h1 className="font-display font-bold text-2xl text-ink mb-2">History</h1>
      <p className="text-subtext text-sm mb-8">Every critique you&apos;ve generated, newest first.</p>

      {isLoading && <p className="text-sm text-subtext">Loading...</p>}

      {!isLoading && items.length === 0 && (
        <div className="bg-white border border-borderline rounded-2xl p-10 text-center">
          <p className="text-sm text-subtext">
            You haven&apos;t generated any critiques yet. Head to your Dashboard to get started.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} className="bg-white border border-borderline rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleOpen(item.id)}
                className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-canvas transition-colors cursor-pointer"
              >
                {/* Track icon */}
                <div className="w-12 h-12 rounded-lg bg-canvas border border-borderline flex items-center justify-center shrink-0">
                  {item.track === "design" ? (
                    <svg className="w-5 h-5 text-design-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-dev-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink truncate">{item.title}</p>
                  <p className="text-xs text-subtext mt-0.5">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>

                {item.score !== null && (
                  <span className="font-mono font-bold text-sm text-coral shrink-0">{item.score}/100</span>
                )}

                <svg
                  className={`w-4 h-4 text-subtext transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 animate-fade-in">
                  <CritiqueResult critique={item.critique_text} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}