import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productName, description, targetCustomer, competitors, differentiator, brandVoice, followUp, history } = body;

  const context = `Product: ${productName}. Description: ${description}. Target customer: ${targetCustomer}. Competitors: ${competitors}. Differentiator: ${differentiator}. Brand voice: ${brandVoice}.`;

  const messages = followUp
    ? [
        { role: "user" as const, content: `You are a SaaS brand strategist. Here is the brand context: ${context}\n\nNow answer this follow-up question in detail: ${followUp}` },
      ]
    : [
        { role: "user" as const, content: `You are a SaaS marketing expert. ${context} Create a full brand strategy.` },
      ];

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages,
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return NextResponse.json({ result: text });
}
