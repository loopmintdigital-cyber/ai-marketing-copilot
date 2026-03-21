import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();
export async function POST(req: NextRequest) {
  const { sequenceType, persona, feature, sequenceLength, tone, brandStrategy, answers } = await req.json();
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `You are an email marketing expert.
Brand Info:
- Product: ${answers.productName}
- Description: ${answers.description}
- Target Customer: ${answers.targetCustomer}
- Brand Voice: ${answers.brandVoice}
- Differentiator: ${answers.differentiator}
Brand Strategy:
${brandStrategy}
Write a ${sequenceLength}-email ${sequenceType} sequence for: ${persona}
Feature to highlight: ${feature}
${tone ? `Tone: ${tone}` : ""}

IMPORTANT FORMATTING RULES:
- Do NOT use markdown symbols like **, ##, >, or backticks
- Do NOT wrap content in code blocks
- Use plain text only
- Use CAPS for email subject lines and section headers
- Separate each email clearly with ---`,
      },
    ],
  });
  const result = (response.content[0] as { text: string }).text;
  return NextResponse.json({ result });
}
