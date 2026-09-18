export type CritiqueSection = {
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

export function parseCritique(raw: string): {
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

export function bulletLines(body: string): string[] {
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