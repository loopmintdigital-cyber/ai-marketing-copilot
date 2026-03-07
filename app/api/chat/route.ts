import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { messages, brandStrategy, answers } = await req.json();

  const systemPrompt = `You are an AI marketing expert and co-pilot for ${answers.productName}.

Here is the brand strategy you generated for them:
${brandStrategy}

Help the user with any marketing tasks — writing social posts, ad copy, email sequences, landing page copy, taglines, and more. Always stay consistent with their brand voice: ${answers.brandVoice}. Keep responses concise and actionable.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return NextResponse.json({ result: text });
}