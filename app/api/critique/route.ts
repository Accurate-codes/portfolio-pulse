import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

type CritiqueRequest = {
  content?: string;
  track?: "design" | "dev";
  fileData?: string;
  fileName?: string;
  fileType?: string;
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

export const FREE_CRITIQUE_LIMIT = 3;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is missing from .env.local." },
        { status: 500 },
      );
    }

    const {
      content = "",
      track = "design",
      fileData,
      fileName,
      fileType,
    } = (await request.json()) as CritiqueRequest;

    // --- Usage limit check ---
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "You must be signed in to request a critique." },
        { status: 401 },
      );
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const usedCount = (clerkUser.privateMetadata?.critiqueCount as number) || 0;

    if (usedCount >= FREE_CRITIQUE_LIMIT) {
      return NextResponse.json(
        { error: "You've used all 3 free critiques. Upgrade to keep going." },
        { status: 403 },
      );
    }
    // --- End usage limit check ---

    if (!content.trim() && !fileData) {
      return NextResponse.json(
        { error: "Please provide a file, link, or code to critique." },
        { status: 400 },
      );
    }

    // PDFs aren't reliably supported across OpenRouter's free vision models yet.
    if (fileType === "application/pdf" || fileName?.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "PDF uploads aren't supported right now — please upload an image instead." },
        { status: 400 },
      );
    }

    const portfolioType =
      track === "dev" ? "software development portfolio" : "design portfolio";

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
Do not invent weaknesses when the submitted work is already excellent.
`;

    // Build the message content array in OpenAI/OpenRouter's format.
    const userContent: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    > = [{ type: "text", text: prompt }];

    if (fileData && fileType?.startsWith("image/")) {
      // fileData already arrives as a data URL (e.g. "data:image/png;base64,...")
      // which OpenRouter accepts directly as image_url.url — no need to strip it.
      userContent.push({ type: "image_url", image_url: { url: fileData } });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || "OpenRouter request failed.";
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

    const rawCritique: string | undefined = data?.choices?.[0]?.message?.content;
    const critique = rawCritique ? removeMarkdown(rawCritique) : "";

    if (!critique) {
      throw new Error("The AI returned an empty critique.");
    }

    // Only count this against the user's free limit once we know it succeeded.
    await client.users.updateUserMetadata(userId, {
      privateMetadata: { critiqueCount: usedCount + 1 },
    });

    return NextResponse.json({
      critique,
      remaining: FREE_CRITIQUE_LIMIT - (usedCount + 1),
    });
  } catch (caughtError) {
    console.error("OpenRouter critique error:", caughtError);

    const message =
      caughtError instanceof Error ? caughtError.message : "Failed to generate critique.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}