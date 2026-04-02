import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from '@supabase/supabase-js';
import { auth } from "@clerk/nextjs/server";

const client = new Anthropic();
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

export async function POST(req: NextRequest) {
  
  const { campaignGoal, targetAudience, budget, feature, destinationURL, brandStrategy, answers, userId } = await req.json();
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [{ role: "user", content: `You are a paid advertising expert.
Brand Info:
- Product: ${answers.productName}
- Description: ${answers.description}
- Target Customer: ${answers.targetCustomer}
- Brand Voice: ${answers.brandVoice}
- Differentiator: ${answers.differentiator}
Brand Strategy: ${brandStrategy}
Create Google RSA + Meta ad campaigns for goal: ${campaignGoal}
Target audience: ${targetAudience}
Budget: ${budget}
Feature to promote: ${feature}
${destinationURL ? `Destination URL: ${destinationURL}` : ""}
IMPORTANT FORMATTING RULES:
- Do NOT use markdown symbols like **, ##, >, or backticks
- Use plain text only
- Use CAPS for section headers like GOOGLE ADS, META ADS` }],
  });
  const result = (response.content[0] as { text: string }).text;
  if (userId) await supabase.from('content_history').insert({ user_id: userId, module: 'ads', inputs: { campaignGoal, targetAudience, feature }, result });
  return NextResponse.json({ result });
}
