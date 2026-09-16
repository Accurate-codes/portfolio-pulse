import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const FREE_CRITIQUE_LIMIT = 3;

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const used = (user.privateMetadata?.critiqueCount as number) || 0;

  return NextResponse.json({
    used,
    limit: FREE_CRITIQUE_LIMIT,
    remaining: Math.max(FREE_CRITIQUE_LIMIT - used, 0),
  });
}