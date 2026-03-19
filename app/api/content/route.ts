import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();
export async function POST(req: NextRequest) {
  const { pageType, benefit, persona, ctaGoal, brandStrategy, answers } = await req.json();
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [{ role: "user", content: `You are a world-class copywriter for SaaS companies. Product: ${answers.productName}. Description: ${answers.description}. Brand Voice: ${answers.brandVoice}. Write copy for a ${pageType} page. Key benefit: ${benefit}. Persona: ${persona}. CTA goal: ${ctaGoal}. Provide: Hero headline, Subheadline, 3 body copy sections, 5 feature bullets, CTA button text, Meta description.` }],
  });
  const result = (response.content[0] as { text: string }).text;
  return NextResponse.json({ result });
}
