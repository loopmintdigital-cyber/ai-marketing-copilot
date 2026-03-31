import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from '@supabase/supabase-js';
import { auth } from "@clerk/nextjs/server";

const client = new Anthropic();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  const { platform, goal, productNews, brandStrategy, answers } = await req.json();
  
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: `You are a social media expert for SaaS companies.
Brand Info:
- Product: ${answers.productName}
- Description: ${answers.description}
- Target Customer: ${answers.targetCustomer}
- Brand Voice: ${answers.brandVoice}
- Differentiator: ${answers.differentiator}
Brand Strategy: ${brandStrategy}
Create a 7-day ${platform} post calendar with goal: ${goal}.
${productNews ? `Recent news to include: ${productNews}` : ""}
For each day provide:
- Day number and best posting time
- Post content ready to copy-paste
- Hashtags
- Content type
Format each day clearly with --- between days.
IMPORTANT FORMATTING RULES:
- Do NOT use markdown symbols like **, ##, >, or backticks
- Use plain text only
- Use CAPS for emphasis`,
    }],
  });
  
  const result = (response.content[0] as { text: string }).text;
  
  // Save to Supabase
  if (userId) {
    await supabase.from('content_history').insert({
      user_id: userId,
      module: 'social',
      inputs: { platform, goal, productNews },
      result,
    });
  }
  
  return NextResponse.json({ result });
}
