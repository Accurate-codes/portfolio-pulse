"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

type Track = "design" | "dev";

type CritiquePayload = {
  track: Track;
  content: string;
  fileData?: string;
  fileName?: string;
  fileType?: string;
};

type CritiqueSection = { title: string; body: string };

const SECTION_HEADERS = [
  "OVERALL SCORE",
  "STRENGTHS",
  "WEAKNESSES",
  "MINOR REFINEMENTS",
  "NEXT STEPS",
  "FINAL VERDICT",
];

function parseCritique(raw: string): { score: number | null; sections: CritiqueSection[] } {
  const lines = raw.split("\n");
  const sections: CritiqueSection[] = [];
  let currentTitle: string | null = null;
  let currentBody: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const matchedHeader = SECTION_HEADERS.find(
      (header) => trimmed.toUpperCase() === header
    );

    if (matchedHeader) {
      if (currentTitle) {
        sections.push({ title: currentTitle, body: currentBody.join("\n").trim() });
      }
      currentTitle = matchedHeader;
      currentBody = [];
    } else if (currentTitle) {
      currentBody.push(line);
    }
  }

  if (currentTitle) {
    sections.push({ title: currentTitle, body: currentBody.join("\n").trim() });
  }

  const scoreSection = sections.find((s) => s.title === "OVERALL SCORE");
  const scoreMatch = scoreSection?.body.match(/(\d{1,3})\s*(?:\/\s*100)?/);
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

  return { score, sections };
}

function bulletLines(body: string): string[] {
  return body
    .split("\n")
    .map((line) => line.replace(/^•\s*/, "").trim())
    .filter(Boolean);
}

export default function SelectTrack() {
  const [track, setTrack] = useState<Track>("design");
  const [isLoading, setIsLoading] = useState(false);
  const [critique, setCritique] = useState("");
  const [error, setError] = useState("");

  // Design track state
  const [file, setFile] = useState<File | null>(null);
  const [figmaLink, setFigmaLink] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Development track state
  const [repoLink, setRepoLink] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");

  function clearResult() {
    setCritique("");
    setError("");
  }

  function changeTrack(nextTrack: Track) {
    setTrack(nextTrack);
    clearResult();
  }

  function handleFileSelect(selected: FileList | null) {
    if (selected && selected.length > 0) {
      setFile(selected[0]);
      clearResult();
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFileSelect(event.dataTransfer.files);
  }

  function convertFileToDataUrl(selectedFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () =>
        reject(new Error("The selected file could not be read."));

      reader.readAsDataURL(selectedFile);
    });
  }

  async function handleSubmit() {
    try {
      setIsLoading(true);
      clearResult();

      let content = "";

      if (track === "design") {
        content = [
          "Review this design portfolio and provide a detailed professional critique.",
          figmaLink ? `Public Figma link: ${figmaLink}` : "",
        ]
          .filter(Boolean)
          .join("\n\n");
      } else {
        content = [
          "Review this software development portfolio submission.",
          repoLink ? `Public GitHub repository: ${repoLink}` : "",
          codeSnippet ? `Code submission:\n${codeSnippet}` : "",
        ]
          .filter(Boolean)
          .join("\n\n");
      }

      const payload: CritiquePayload = {
        track,
        content,
      };

      if (file) {
        payload.fileData = await convertFileToDataUrl(file);
        payload.fileName = file.name;
        payload.fileType = file.type;
      }

      const response = await fetch("/api/critique", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate critique.");
      }

      setCritique(data.critique);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const canSubmit =
    track === "design"
      ? Boolean(file || figmaLink.trim())
      : Boolean(repoLink.trim() || codeSnippet.trim());

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="w-full bg-white border-b border-borderline">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-ink flex items-center justify-center p-1.5 shadow-sm">
              <svg
                viewBox="0 0 32 32"
                fill="none"
                className="w-full h-full stroke-coral stroke-[2.5]"
              >
                <path
                  d="M4 16h6l3-8 5 16 4-11 3 5 4-2h3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
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
        {/* Track selector */}
        <div className="bg-zinc-900 rounded-full p-1.5 flex items-center gap-1 mb-10 shadow-sm">
          <button
            type="button"
            onClick={() => changeTrack("design")}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-colors duration-300 cursor-pointer ${
              track === "design"
                ? "bg-coral text-white"
                : "text-zinc-300 hover:text-white"
            }`}
          >
            I&apos;m a Designer
          </button>

          <button
            type="button"
            onClick={() => changeTrack("dev")}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-colors duration-300 cursor-pointer ${
              track === "dev"
                ? "bg-dev-accent text-white"
                : "text-zinc-300 hover:text-white"
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
                  <h1 className="font-display font-bold text-2xl text-ink mb-2">
                    Design Upload
                  </h1>

                  <p className="text-subtext text-sm">
                    Upload an image or PDF, or paste a public Figma link.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* File upload */}
                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[220px] transition-colors ${
                      isDragging
                        ? "border-design-accent bg-pink-50/40"
                        : "border-borderline"
                    }`}
                  >
                    {file ? (
                      <>
                        <svg
                          className="w-8 h-8 text-design-accent mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>

                        <p className="text-sm font-semibold text-ink mb-1 break-all">
                          {file.name}
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            clearResult();
                          }}
                          className="text-xs text-subtext hover:text-coral underline mt-1 cursor-pointer"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-subtext mb-1">
                          Drag a file to upload
                        </p>

                        <p className="text-xs text-subtext mb-4">or</p>

                        <button
                          type="button"
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
                          onChange={(event) =>
                            handleFileSelect(event.target.files)
                          }
                        />
                      </>
                    )}
                  </div>

                  {/* Figma input */}
                  <div className="border border-borderline rounded-xl p-6 flex flex-col justify-center min-h-[220px]">
                    <label
                      htmlFor="figma-link"
                      className="text-sm font-semibold text-ink mb-2"
                    >
                      Paste Figma link
                    </label>

                    <input
                      id="figma-link"
                      type="url"
                      placeholder="https://figma.com/file/..."
                      value={figmaLink}
                      onChange={(event) => {
                        setFigmaLink(event.target.value);
                        clearResult();
                      }}
                      className="w-full border border-borderline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-subtext/60 focus:outline-none focus:ring-2 focus:ring-design-accent/40 focus:border-design-accent"
                    />

                    <p className="text-xs text-subtext mt-2">
                      Make sure link sharing is turned on.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="font-display font-bold text-2xl text-ink mb-2">
                    Development Upload
                  </h1>

                  <p className="text-subtext text-sm">
                    Paste a public GitHub repository link or a code snippet.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* GitHub input */}
                  <div className="border border-borderline rounded-xl p-6 flex flex-col justify-center min-h-[220px]">
                    <label
                      htmlFor="repo-link"
                      className="text-sm font-semibold text-ink mb-2 flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4 text-dev-accent"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.833.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>

                      GitHub repo link
                    </label>

                    <input
                      id="repo-link"
                      type="url"
                      placeholder="https://github.com/username/repo"
                      value={repoLink}
                      onChange={(event) => {
                        setRepoLink(event.target.value);
                        clearResult();
                      }}
                      className="w-full border border-borderline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-subtext/60 focus:outline-none focus:ring-2 focus:ring-dev-accent/40 focus:border-dev-accent"
                    />

                    <p className="text-xs text-subtext mt-2">
                      Make sure the repo is public.
                    </p>
                  </div>

                  {/* Code input */}
                  <div className="border border-borderline rounded-xl p-6 flex flex-col min-h-[220px]">
                    <label
                      htmlFor="code-snippet"
                      className="text-sm font-semibold text-ink mb-2"
                    >
                      Paste a code snippet
                    </label>

                    <textarea
                      id="code-snippet"
                      placeholder="Paste your code here..."
                      value={codeSnippet}
                      onChange={(event) => {
                        setCodeSnippet(event.target.value);
                        clearResult();
                      }}
                      className="w-full flex-1 border border-borderline rounded-lg px-3 py-2.5 text-sm font-mono text-ink placeholder:text-subtext/60 placeholder:font-sans resize-none focus:outline-none focus:ring-2 focus:ring-dev-accent/40 focus:border-dev-accent"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Submit button */}
            <button
              type="button"
              disabled={!canSubmit || isLoading}
              onClick={handleSubmit}
              className="w-full mt-8 py-3.5 rounded-xl bg-coral text-white font-semibold text-sm hover:bg-[#ff4356] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-coral cursor-pointer"
            >
              {isLoading ? "Reviewing your work..." : "Get my critique"}
            </button>

            {/* Error message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Critique result */}
            {critique && (() => {
              const { score, sections } = parseCritique(critique);

              return (
                <div className="mt-6 border border-borderline rounded-2xl overflow-hidden animate-fade-in">
                  {/* Score header */}
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
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}