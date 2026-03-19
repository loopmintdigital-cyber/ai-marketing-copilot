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
        content: `You are an email marketing expert for SaaS companies.

Brand Info:
- Product: ${answers.productName}
- Description: ${answers.description}
- Target Customer: ${answers.targetCustomer}
- Brand Voice: ${answers.brandVoice}

Brand Strategy:
${brandStrategy}

Create a ${sequenceLength}-email ${sequenceType} sequence.
Target persona: ${persona}
Feature to highlight: ${feature}
Tone: ${tone || answers.brandVoice}

For each email provide:
- Email number and subject line
- Preview text
- Body copy
- CTA

Format each email clearly with --- between them.`,
      },
    ],
  });

  const result = (response.content[0] as { text: string }).text;
  return NextResponse.json({ result });
}