import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/app/lib/db";

type CritiqueRequest = {
  content?: string;
  track?: "design" | "dev";
  fileData?: string;
  fileName?: string;
  fileType?: string;
};

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

function removeMarkdown(text: string) {
  return text
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^---+$/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractScore(critique: string): number | null {
  const scoreMatch = critique.match(
    /(?:OVERALL SCORE[\s:–-]*)?(\d{1,3})\s*(?:\/\s*100|out of 100)/i,
  );

  if (!scoreMatch) {
    return null;
  }

  const score = Number(scoreMatch[1]);

  if (Number.isNaN(score)) {
    return null;
  }

  return Math.min(Math.max(score, 0), 100);
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "OPENROUTER_API_KEY is missing from .env.local.",
        },
        { status: 500 },
      );
    }

    let requestBody: CritiqueRequest;

    try {
      requestBody = (await request.json()) as CritiqueRequest;
    } catch {
      return NextResponse.json(
        {
          error: "The request body is empty or contains invalid JSON.",
        },
        { status: 400 },
      );
    }

    const {
      content = "",
      track = "design",
      fileData,
      fileName,
      fileType,
    } = requestBody;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: "You must be signed in to request a critique.",
        },
        { status: 401 },
      );
    }

    if (!content.trim() && !fileData) {
      return NextResponse.json(
        {
          error: "Please provide a file, link, or code to critique.",
        },
        { status: 400 },
      );
    }

    if (
      fileType === "application/pdf" ||
      fileName?.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        {
          error:
            "PDF uploads aren't supported right now—please upload an image instead.",
        },
        { status: 400 },
      );
    }

    const portfolioType =
      track === "dev"
        ? "software development portfolio"
        : "design portfolio";

    const prompt = `
You are an expert portfolio reviewer.

Review the following ${portfolioType} submission.

Submission information:

${content || "The portfolio is included in the attached image."}

Choose the response format based on the score.

IF THE SCORE IS BETWEEN 95 AND 100:

OVERALL SCORE

Give the score and explain why the work is excellent.

STRENGTHS

Highlight the strongest parts of the work.

FINAL VERDICT

State that the work is professional, polished, and ready to present or publish.

Do not include WEAKNESSES or NEXT STEPS for scores between 95 and 100.

Do not invent problems just to provide criticism.

IF THE SCORE IS BETWEEN 80 AND 94:

OVERALL SCORE

Give the score and a short explanation.

STRENGTHS

List the strongest parts of the work.

MINOR REFINEMENTS

Only mention small improvements that would make the work even better.

IF THE SCORE IS BELOW 80:

OVERALL SCORE

Give the score and a short explanation.

STRENGTHS

List what was done well.

WEAKNESSES

Explain the important problems.

NEXT STEPS

Give practical and prioritized steps for improvement.

IMPORTANT FORMATTING INSTRUCTION:

Return plain text only.

Do not use Markdown.

Do not use #, ###, **, *, ---, underscores, tables, or code fences.

Always write the overall score using this exact format: 85/100.

Do not invent weaknesses when the submitted work is already excellent.
`;

    const userContent: Array<
      | {
          type: "text";
          text: string;
        }
      | {
          type: "image_url";
          image_url: {
            url: string;
          };
        }
    > = [
      {
        type: "text",
        text: prompt,
      },
    ];

    if (fileData && fileType?.startsWith("image/")) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: fileData,
        },
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            {
              role: "system",
              content:
                "You are an expert design and software development portfolio reviewer. Always return clean plain text without Markdown symbols.",
            },
            {
              role: "user",
              content: userContent,
            },
          ],
        }),
      },
    );

    const responseText = await response.text();

    if (!responseText) {
      throw new Error(
        `OpenRouter returned an empty response. Status: ${response.status}.`,
      );
    }

    let data: OpenRouterResponse;

    try {
      data = JSON.parse(responseText) as OpenRouterResponse;
    } catch {
      console.error("Invalid OpenRouter response:", responseText);

      throw new Error(
        "OpenRouter returned a response that was not valid JSON.",
      );
    }

    if (!response.ok) {
      const message =
        data.error?.message || "OpenRouter request failed.";

      const isRateLimit = response.status === 429;

      return NextResponse.json(
        {
          error: isRateLimit
            ? "The free usage limit has been reached. Please wait a moment and try again."
            : message,
        },
        { status: response.status },
      );
    }

    const rawCritique = data.choices?.[0]?.message?.content;

    const critique = rawCritique
      ? removeMarkdown(rawCritique)
      : "";

    if (!critique) {
      throw new Error("The AI returned an empty critique.");
    }

    const score = extractScore(critique);
    const trimmedContent = content.trim();

    const title =
      fileName ||
      (trimmedContent.startsWith("http")
        ? trimmedContent
        : "Code snippet");

    if (!sql) {
      throw new Error(
        "Database connection is missing. Add DATABASE_URL or POSTGRES_URL to .env.local.",
      );
    }

    await sql`
      INSERT INTO critiques (
        user_id,
        track,
        title,
        score,
        critique_text
      )
      VALUES (
        ${userId},
        ${track},
        ${title},
        ${score},
        ${critique}
      )
    `;

    return NextResponse.json({
      critique,
      score,
    });
  } catch (caughtError) {
    console.error("Critique API error:", caughtError);

    const message =
      caughtError instanceof Error
        ? caughtError.message
        : "Failed to generate critique.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}