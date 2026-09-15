"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

type Track = "design" | "dev";

export default function SelectTrack() {
  const [track, setTrack] = useState<Track>("design");

  // Design track state
  const [file, setFile] = useState<File | null>(null);
  const [figmaLink, setFigmaLink] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dev track state
  const [repoLink, setRepoLink] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");

  function handleFileSelect(selected: FileList | null) {
    if (selected && selected.length > 0) {
      setFile(selected[0]);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }

  const canSubmit = track === "design" ? !!file || !!figmaLink : !!repoLink || !!codeSnippet;

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

      <div className="flex flex-col items-center px-6 py-16">
        {/* Segmented Toggle */}
        <div className="bg-zinc-900 rounded-full p-1.5 flex items-center gap-1 mb-10 shadow-sm">
          <button
            onClick={() => setTrack("design")}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-colors duration-300 cursor-pointer ${
              track === "design" ? "bg-coral text-white" : "text-zinc-300 hover:text-white"
            }`}
          >
            I&apos;m a Designer
          </button>
          <button
            onClick={() => setTrack("dev")}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-colors duration-300 cursor-pointer ${
              track === "dev" ? "bg-dev-accent text-white" : "text-zinc-300 hover:text-white"
            }`}
          >
            I&apos;m a Developer
          </button>
        </div>

        <div className="max-w-2xl w-full">
          <div
            key={track}
            className="animate-fade-in bg-white border border-borderline rounded-2xl shadow-sm p-8"
          >
            {track === "design" ? (
              <>
                <div className="text-center mb-8">
                  <h1 className="font-display font-bold text-2xl text-ink mb-2">Design Upload</h1>
                  <p className="text-subtext text-sm">Upload a file or paste a Figma link — either works.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[220px] transition-colors ${
                      isDragging ? "border-design-accent bg-pink-50/40" : "border-borderline"
                    }`}
                  >
                    {file ? (
                      <>
                        <svg className="w-8 h-8 text-design-accent mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-semibold text-ink mb-1">{file.name}</p>
                        <button onClick={() => setFile(null)} className="text-xs text-subtext hover:text-coral underline mt-1 cursor-pointer">
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-subtext mb-1">Drag a file to upload</p>
                        <p className="text-xs text-subtext mb-4">or</p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-ink hover:bg-navy text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                        >
                          Browse file
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleFileSelect(e.target.files)}
                        />
                      </>
                    )}
                  </div>

                  <div className="border border-borderline rounded-xl p-6 flex flex-col justify-center min-h-[220px]">
                    <label htmlFor="figma-link" className="text-sm font-semibold text-ink mb-2">
                      Paste Figma link
                    </label>
                    <input
                      id="figma-link"
                      type="url"
                      placeholder="https://figma.com/file/..."
                      value={figmaLink}
                      onChange={(e) => setFigmaLink(e.target.value)}
                      className="w-full border border-borderline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-subtext/60 focus:outline-none focus:ring-2 focus:ring-design-accent/40 focus:border-design-accent"
                    />
                    <p className="text-xs text-subtext mt-2">Make sure link sharing is turned on.</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="font-display font-bold text-2xl text-ink mb-2">Development Upload</h1>
                  <p className="text-subtext text-sm">Paste a GitHub repo link or a code snippet — either works.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="border border-borderline rounded-xl p-6 flex flex-col justify-center min-h-[220px]">
                    <label htmlFor="repo-link" className="text-sm font-semibold text-ink mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-dev-accent" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.833.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      GitHub repo link
                    </label>
                    <input
                      id="repo-link"
                      type="url"
                      placeholder="https://github.com/username/repo"
                      value={repoLink}
                      onChange={(e) => setRepoLink(e.target.value)}
                      className="w-full border border-borderline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-subtext/60 focus:outline-none focus:ring-2 focus:ring-dev-accent/40 focus:border-dev-accent"
                    />
                    <p className="text-xs text-subtext mt-2">Make sure the repo is public.</p>
                  </div>

                  <div className="border border-borderline rounded-xl p-6 flex flex-col min-h-[220px]">
                    <label htmlFor="code-snippet" className="text-sm font-semibold text-ink mb-2">
                      Paste a code snippet
                    </label>
                    <textarea
                      id="code-snippet"
                      placeholder="Paste your code here..."
                      value={codeSnippet}
                      onChange={(e) => setCodeSnippet(e.target.value)}
                      className="w-full flex-1 border border-borderline rounded-lg px-3 py-2.5 text-sm font-mono text-ink placeholder:text-subtext/60 placeholder:font-sans resize-none focus:outline-none focus:ring-2 focus:ring-dev-accent/40 focus:border-dev-accent"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              disabled={!canSubmit}
              className="w-full mt-8 py-3.5 rounded-xl bg-coral text-white font-semibold text-sm hover:bg-[#ff4356] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-coral cursor-pointer"
            >
              Get my critique
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}