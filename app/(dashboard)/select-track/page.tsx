"use client";

import { useEffect, useRef, useState } from "react";
import CritiqueResult from "@/app/components/CritiqueResult";

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
          {critique && (
            <div className="mt-6">
              <CritiqueResult critique={critique} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}