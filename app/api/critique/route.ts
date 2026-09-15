import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

type CritiqueRequest = {
  content?: string;
  track?: "design" | "dev";
  fileData?: string;
  fileName?: string;
  fileType?: string;
};

type GeminiInput =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "image";
      data: string;
      mime_type: string;
    }
  | {
      type: "document";
      data: string;
      mime_type: "application/pdf";
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

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is missing from .env.local.",
        },
        {
          status: 500,
        },
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const {
      content = "",
      track = "design",
      fileData,
      fileName,
      fileType,
    } = (await request.json()) as CritiqueRequest;

    if (!content.trim() && !fileData) {
      return NextResponse.json(
        {
          error: "Please provide a file, link, or code to critique.",
        },
        {
          status: 400,
        },
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
${content || "The portfolio is included in the attached file."}

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

    const input: GeminiInput[] = [
      {
        type: "text",
        text: prompt,
      },
    ];

    if (fileData) {
      // The frontend sends files as data URLs:
      // data:image/png;base64,ABC123...
      // Gemini needs only the Base64 section after the comma.
      const base64Data = fileData.includes(",")
        ? fileData.split(",")[1]
        : fileData;

      if (!base64Data) {
        return NextResponse.json(
          {
            error: "The uploaded file could not be processed.",
          },
          {
            status: 400,
          },
        );
      }

      if (fileType?.startsWith("image/")) {
        input.push({
          type: "image",
          data: base64Data,
          mime_type: fileType,
        });
      } else if (
        fileType === "application/pdf" ||
        fileName?.toLowerCase().endsWith(".pdf")
      ) {
        input.push({
          type: "document",
          data: base64Data,
          mime_type: "application/pdf",
        });
      } else {
        return NextResponse.json(
          {
            error: "Only image and PDF uploads are currently supported.",
          },
          {
            status: 400,
          },
        );
      }
    }

    const interaction = await ai.interactions.create({
  model: "gemini-3.8-flash",
  input,
  system_instruction:
    "You are an expert design and software development portfolio reviewer. Always return clean plain text without Markdown symbols.",
});

const rawCritique = interaction.output_text;
const critique = rawCritique ? removeMarkdown(rawCritique) : "";

if (!critique) {
  throw new Error("Gemini returned an empty critique.");
}

return NextResponse.json({
  critique,
});
  } catch (caughtError) {
    console.error("Gemini critique error:", caughtError);

    const message =
      caughtError instanceof Error
        ? caughtError.message
        : "Failed to generate critique.";

    const isRateLimit =
      message.includes("429") ||
      message.toLowerCase().includes("quota") ||
      message.toLowerCase().includes("resource_exhausted");

    if (isRateLimit) {
      return NextResponse.json(
        {
          error:
            "The free Gemini usage limit has been reached. Please wait for the limit to reset and try again.",
        },
        {
          status: 429,
        },
      );
    }

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