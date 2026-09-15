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

Return your critique using exactly these sections:

OVERALL SCORE
Give a score out of 100 and briefly explain the score.

STRENGTHS
List the specific things that were done well.

WEAKNESSES
List the specific problems or areas that need improvement.

NEXT STEPS
Give practical and prioritized steps the person should take to improve the portfolio.

Be professional, honest, specific, constructive, and encouraging.

Do not invent details that are not present in the submission.

If only a link was supplied and you cannot inspect its content, clearly ask the user to upload the portfolio or paste the relevant code instead.
IMPORTANT FORMATTING INSTRUCTION:

Return plain text only.

Do not use Markdown formatting.
Do not use #, ###, **, *, ---, underscores, tables, or code fences.

Write section headings normally, like this:

OVERALL SCORE
Score: 75/100
Explanation: ...

STRENGTHS
1. ...
2. ...

WEAKNESSES
1. ...
2. ...

NEXT STEPS
1. ...
2. ...
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