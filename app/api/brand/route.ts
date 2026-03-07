import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productName, description, targetCustomer, competitors, differentiator, brandVoice } = body;
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: "You are a SaaS marketing expert. Product: " + productName + ". Description: " + description + ". Target Customer: " + targetCustomer + ". Competitors: " + competitors + ". Differentiator: " + differentiator + ". Brand Voice: " + brandVoice + ". Generate: 1) A one-sentence positioning statement 2) Three messaging pillars 3) Two tagline options 4) An ICP persona card." }],
  });
  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return NextResponse.json({ result: text });
}
