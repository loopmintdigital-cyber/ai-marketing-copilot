import { auth, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { answers, brandStrategy } = await req.json();

  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: { answers, brandStrategy, onboardingComplete: true },
  });

  return NextResponse.json({ success: true });
}
