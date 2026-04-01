import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import Anthropic from "@anthropic-ai/sdk";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { answers, brandStrategy } = await req.json();

  // Save to Supabase only
  await supabase.from('brand_profiles').upsert({
    user_id: userId,
    answers,
    brand_strategy: brandStrategy,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  return NextResponse.json({ success: true });
}
