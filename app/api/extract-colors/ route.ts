import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http")) targetUrl = "https://" + targetUrl;

    const domain = targetUrl.replace(/https?:\/\//, "").replace(/www\./, "").split("/")[0];

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `What are the main brand colors for the website/company: "${domain}"?

If you recognize this brand, return their actual brand colors.
If you don't recognize it, make educated guesses based on the domain name and industry.

Return ONLY a valid JSON array of exactly 3-5 hex color codes.
Example: ["#7c3aed", "#ec4899", "#1a1a2e"]

Rules:
- Include primary brand color, secondary color, and accent color
- Avoid pure black (#000000) or pure white (#ffffff) unless the brand is specifically monochrome
- Return nothing else — just the JSON array`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    const match = text.match(/\[[\s\S]*?\]/);
    if (!match) return NextResponse.json({ colors: [], error: "Could not identify brand colors" });

    const colors: string[] = JSON.parse(match[0]);
    const validColors = colors
      .filter((c: string) => typeof c === "string" && /^#[0-9A-Fa-f]{3,6}$/.test(c.trim()))
      .map((c: string) => c.trim())
      .slice(0, 5);

    if (validColors.length === 0) {
      return NextResponse.json({ colors: [], error: "Could not extract colors. Try Presets or Custom tab." });
    }

    return NextResponse.json({ colors: validColors, domain });
  } catch (error: any) {
    console.error("Color extraction error:", error);
    return NextResponse.json({ colors: [], error: "Something went wrong. Try Presets or Custom tab." });
  }
}