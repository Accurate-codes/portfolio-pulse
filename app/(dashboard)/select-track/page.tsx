"use client";

import { useEffect, useRef, useState } from "react";

type Track = "design" | "dev";

type CritiquePayload = {
  track: Track;
  content: string;
  fileData?: string;
  fileName?: string;
  fileType?: string;
};

type CritiqueResponse = {
  critique?: string;
  score?: number | null;
  error?: string;
};

type CritiqueSection = {
  title: string;
  body: string;
};

const SECTION_HEADERS = [
  "OVERALL SCORE",
  "STRENGTHS",
  "WEAKNESSES",
  "MINOR REFINEMENTS",
  "NEXT STEPS",
  "FINAL VERDICT",
];

function parseCritique(raw: string): {
  score: number | null;
  sections: CritiqueSection[];
} {
  const lines = raw.split("\n");
  const sections: CritiqueSection[] = [];

  let currentTitle: string | null = null;
  let currentBody: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const normalizedLine = trimmed.replace(/:$/, "").toUpperCase();

    const matchedHeader = SECTION_HEADERS.find(
      (header) => normalizedLine === header,
    );

    if (matchedHeader) {
      if (currentTitle) {
        sections.push({
          title: currentTitle,
          body: currentBody.join("\n").trim(),
        });
      }

      currentTitle = matchedHeader;
      currentBody = [];
    } else if (currentTitle) {
      currentBody.push(line);
    }
  }

  if (currentTitle) {
    sections.push({
      title: currentTitle,
      body: currentBody.join("\n").trim(),
    });
  }

  const scoreSection = sections.find(
    (section) => section.title === "OVERALL SCORE",
  );

  const scoreMatch = scoreSection?.body.match(
    /(\d{1,3})\s*(?:\/\s*100|out of 100)?/i,
  );

  const score = scoreMatch
    ? Math.min(Math.max(parseInt(scoreMatch[1], 10), 0), 100)
    : null;

  return {
    score,
    sections,
  };
}

function bulletLines(body: string): string[] {
  return body
    .split("\n")
    .map((line) =>
      line
        .replace(/^•\s*/, "")
        .replace(/^[-*]\s*/, "")
        .replace(/^\d+[.)]\s*/, "")
        .trim(),
    )
    .filter(Boolean);
}

export default function SelectTrack() {
  const [track, setTrack] = useState<Track>("design");
  const [isLoading, setIsLoading] = useState(false);
  const [critique, setCritique] = useState("");
  const [error, setError] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Design track state
  const [file, setFile] = useState<File | null>(null);
  const [figmaLink, setFigmaLink] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Development track state
  const [repoLink, setRepoLink] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    setElapsedSeconds(0);

    const interval = window.setInterval(() => {
      setElapsedSeconds((previous) => previous + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isLoading]);

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

      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }

        reject(new Error("The selected file could not be converted."));
      };

      reader.onerror = () => {
        reject(new Error("The selected file could not be read."));
      };

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
          figmaLink
            ? `Public Figma link: ${figmaLink.trim()}`
            : "",
        ]
          .filter(Boolean)
          .join("\n\n");
      } else {
        content = [
          "Review this software development portfolio submission.",
          repoLink
            ? `Public GitHub repository: ${repoLink.trim()}`
            : "",
          codeSnippet
            ? `Code submission:\n${codeSnippet.trim()}`
            : "",
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

      const responseText = await response.text();

      if (!responseText) {
        throw new Error(
          `The server returned an empty response. Status: ${response.status}.`,
        );
      }

      let data: CritiqueResponse;

      try {
        data = JSON.parse(responseText) as CritiqueResponse;
      } catch {
        console.error("Invalid server response:", responseText);

        throw new Error(
          "The server returned an invalid response. Check your terminal or Vercel logs.",
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to generate critique. Please try again.",
        );
      }

      if (!data.critique) {
        throw new Error("The server did not return a critique.");
      }

      setCritique(data.critique);
    } catch (caughtError) {
      console.error("Critique submission error:", caughtError);

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
    <div className="flex flex-col items-center px-6 py-16">
      {/* Track selector */}
      <div className="mb-10 flex items-center gap-1 rounded-full bg-zinc-900 p-1.5 shadow-sm">
        <button
          type="button"
          onClick={() => changeTrack("design")}
          className={`cursor-pointer rounded-full px-6 py-2.5 text-sm font-semibold transition-colors duration-300 ${
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
          className={`cursor-pointer rounded-full px-6 py-2.5 text-sm font-semibold transition-colors duration-300 ${
            track === "dev"
              ? "bg-dev-accent text-white"
              : "text-zinc-300 hover:text-white"
          }`}
        >
          I&apos;m a Developer
        </button>
      </div>

      <div className="w-full max-w-2xl">
        <div
          key={track}
          className="animate-fade-in rounded-2xl border border-borderline bg-white p-8 shadow-sm"
        >
          {track === "design" ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="mb-2 font-display text-2xl font-bold text-ink">
                  Design Upload
                </h1>

                <p className="text-sm text-subtext">
                  Upload an image or paste a public Figma link.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* File upload */}
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                    isDragging
                      ? "border-design-accent bg-pink-50/40"
                      : "border-borderline"
                  }`}
                >
                  {file ? (
                    <>
                      <svg
                        className="mb-3 h-8 w-8 text-design-accent"
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

                      <p className="mb-1 break-all text-sm font-semibold text-ink">
                        {file.name}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          clearResult();
                        }}
                        className="mt-1 cursor-pointer text-xs text-subtext underline hover:text-coral"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="mb-1 text-sm text-subtext">
                        Drag an image to upload
                      </p>

                      <p className="mb-4 text-xs text-subtext">or</p>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy"
                      >
                        Browse file
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                          handleFileSelect(event.target.files)
                        }
                      />
                    </>
                  )}
                </div>

                {/* Figma input */}
                <div className="flex min-h-[220px] flex-col justify-center rounded-xl border border-borderline p-6">
                  <label
                    htmlFor="figma-link"
                    className="mb-2 text-sm font-semibold text-ink"
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
                    className="w-full rounded-lg border border-borderline px-3 py-2.5 text-sm text-ink placeholder:text-subtext/60 focus:border-design-accent focus:outline-none focus:ring-2 focus:ring-design-accent/40"
                  />

                  <p className="mt-2 text-xs text-subtext">
                    Make sure link sharing is turned on.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="mb-2 font-display text-2xl font-bold text-ink">
                  Development Upload
                </h1>

                <p className="text-sm text-subtext">
                  Paste a public GitHub repository link or a code snippet.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* GitHub input */}
                <div className="flex min-h-[220px] flex-col justify-center rounded-xl border border-borderline p-6">
                  <label
                    htmlFor="repo-link"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink"
                  >
                    <svg
                      className="h-4 w-4 text-dev-accent"
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
                    className="w-full rounded-lg border border-borderline px-3 py-2.5 text-sm text-ink placeholder:text-subtext/60 focus:border-dev-accent focus:outline-none focus:ring-2 focus:ring-dev-accent/40"
                  />

                  <p className="mt-2 text-xs text-subtext">
                    Make sure the repository is public.
                  </p>
                </div>

                {/* Code input */}
                <div className="flex min-h-[220px] flex-col rounded-xl border border-borderline p-6">
                  <label
                    htmlFor="code-snippet"
                    className="mb-2 text-sm font-semibold text-ink"
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
                    className="w-full flex-1 resize-none rounded-lg border border-borderline px-3 py-2.5 font-mono text-sm text-ink placeholder:font-sans placeholder:text-subtext/60 focus:border-dev-accent focus:outline-none focus:ring-2 focus:ring-dev-accent/40"
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
            className="mt-8 w-full cursor-pointer rounded-xl bg-coral py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#ff4356] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-coral"
          >
            {isLoading
              ? `Reviewing your work... (${elapsedSeconds}s)`
              : "Get my critique"}
          </button>

          {isLoading && (
            <p className="mt-3 text-center text-xs text-subtext">
              This usually takes under a minute—hang tight.
            </p>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Critique result */}
          {critique &&
            (() => {
              const { score, sections } = parseCritique(critique);

              return (
                <div className="animate-fade-in mt-6 overflow-hidden rounded-2xl border border-borderline">
                  {score !== null && (
                    <div className="flex items-center justify-between bg-ink px-6 py-5">
                      <span className="font-display text-lg font-bold text-white">
                        Your Critique
                      </span>

                      <div className="flex items-baseline gap-1 font-mono text-2xl font-bold text-white">
                        <span className="text-coral">{score}</span>
                        <span className="text-sm text-slate-300">
                          /100
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-5 bg-white p-6">
                    {sections.map((section) => {
                      if (section.title === "OVERALL SCORE") {
                        return (
                          <p
                            key={section.title}
                            className="text-sm leading-relaxed text-subtext"
                          >
                            {section.body.replace(
                              /^\d{1,3}\s*(?:\/\s*100|out of 100)?[.:]?\s*/i,
                              "",
                            )}
                          </p>
                        );
                      }

                      if (section.title === "STRENGTHS") {
                        return (
                          <div key={section.title}>
                            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-success">
                              <span className="h-2 w-2 rounded-full bg-success" />
                              Strengths
                            </h3>

                            <ul className="space-y-1.5">
                              {bulletLines(section.body).map(
                                (line, index) => (
                                  <li
                                    key={`${line}-${index}`}
                                    className="flex items-start gap-2 text-sm text-maintext"
                                  >
                                    <span className="shrink-0 text-success">
                                      ✓
                                    </span>
                                    <span>{line}</span>
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        );
                      }

                      if (
                        section.title === "WEAKNESSES" ||
                        section.title === "MINOR REFINEMENTS"
                      ) {
                        return (
                          <div key={section.title}>
                            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber">
                              <span className="h-2 w-2 rounded-full bg-amber" />

                              {section.title === "WEAKNESSES"
                                ? "Weaknesses"
                                : "Minor Refinements"}
                            </h3>

                            <ul className="space-y-1.5">
                              {bulletLines(section.body).map(
                                (line, index) => (
                                  <li
                                    key={`${line}-${index}`}
                                    className="flex items-start gap-2 text-sm text-maintext"
                                  >
                                    <span className="shrink-0 text-amber">
                                      !
                                    </span>
                                    <span>{line}</span>
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        );
                      }

                      if (section.title === "NEXT STEPS") {
                        return (
                          <div key={section.title}>
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink">
                              Next Steps
                            </h3>

                            <ol className="space-y-2">
                              {bulletLines(section.body).map(
                                (line, index) => (
                                  <li
                                    key={`${line}-${index}`}
                                    className="flex items-start gap-2.5 text-sm text-maintext"
                                  >
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-[10px] font-bold text-white">
                                      {index + 1}
                                    </span>
                                    <span>{line}</span>
                                  </li>
                                ),
                              )}
                            </ol>
                          </div>
                        );
                      }

                      if (section.title === "FINAL VERDICT") {
                        return (
                          <div
                            key={section.title}
                            className="rounded-xl border border-borderline bg-canvas p-4"
                          >
                            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink">
                              Final Verdict
                            </h3>

                            <p className="text-sm leading-relaxed text-maintext">
                              {section.body}
                            </p>
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
  );
}