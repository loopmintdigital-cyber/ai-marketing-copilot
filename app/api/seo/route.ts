import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from '@supabase/supabase-js';
import { auth } from "@clerk/nextjs/server";

const client = new Anthropic();
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  const { productCategory, targetKeywords, competitorDomains, articleTopic, brandStrategy, answers } = await req.json();
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [{ role: "user", content: `You are an SEO and content strategy expert.
Brand Info:
- Product: ${answers.productName}
- Description: ${answers.description}
- Target Customer: ${answers.targetCustomer}
- Brand Voice: ${answers.brandVoice}
- Differentiator: ${answers.differentiator}
Brand Strategy: ${brandStrategy}
Product category: ${productCategory}
${targetKeywords ? `Target keywords: ${targetKeywords}` : ""}
${competitorDomains ? `Competitor domains: ${competitorDomains}` : ""}
Article topic: ${articleTopic}
Create a full SEO strategy and article draft.
IMPORTANT FORMATTING RULES:
- Do NOT use markdown symbols like **, ##, >, or backticks
- Use plain text only
- Use CAPS for section headers` }],
  });
  const result = (response.content[0] as { text: string }).text;
  if (userId) await supabase.from('content_history').insert({ user_id: userId, module: 'seo', inputs: { productCategory, articleTopic }, result });
  return NextResponse.json({ result });
}
