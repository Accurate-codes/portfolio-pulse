import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/app/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    if (!sql) {
      return NextResponse.json(
        { error: "Database connection is missing." },
        { status: 500 },
      );
    }

    const rows = await sql`
      SELECT id, track, title, score, critique_text, created_at
      FROM critiques
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ critiques: rows });
  } catch (caughtError) {
    console.error("History API error:", caughtError);

    const message =
      caughtError instanceof Error ? caughtError.message : "Failed to load history.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}