import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { messages, brandStrategy, answers } = await req.json();
  const systemPrompt = `You are an AI marketing expert for ${answers.productName}. Brand strategy: ${brandStrategy}. Brand voice: ${answers.brandVoice}. Help with marketing tasks.`;
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
  });
  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return NextResponse.json({ result: text });
}
