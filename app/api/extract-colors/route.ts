import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ colors: [], error: "URL required" });

    const brand = url.trim().replace(/https?:\/\//, "").replace(/www\./, "").split("/")[0].split(".")[0];

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 150,
      messages: [{
        role: "user",
        content: `Give me the brand colors for "${brand}". If you know this brand, use their real colors. If not, suggest colors that fit the name/industry. Respond with ONLY a JSON array of 3 hex colors. Nothing else. Example: ["#635BFF", "#0A2540", "#00D4FF"]`,
      }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    const match = text.match(/\[[\s\S]*?\]/);
    if (!match) return NextResponse.json({ colors: [], error: "Try again" });

    const colors = JSON.parse(match[0]).filter((c: string) => /^#[0-9A-Fa-f]{3,6}$/.test(c?.trim())).map((c: string) => c.trim()).slice(0, 5);
    return NextResponse.json({ colors });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ colors: [], error: "Try again or use Presets" });
  }
}
