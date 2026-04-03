import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

    // Fetch the website HTML
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ColorExtractor/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await response.text();

    // Use Claude to extract colors from HTML/CSS
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Analyze this website HTML and extract the main brand colors. Look for colors in CSS variables, inline styles, background colors, button colors, and primary UI elements.

Return ONLY a JSON array of hex color codes (3-6 colors), like: ["#7c3aed", "#ec4899", "#3b82f6", "#ffffff"]

Focus on the PRIMARY brand colors, not gray/black/white unless the brand is specifically monochrome.

HTML snippet (first 8000 chars):
${html.slice(0, 8000)}

Return only the JSON array, nothing else.`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    // Parse the JSON array from Claude's response
    const match = text.match(/\[[\s\S]*?\]/);
    if (!match) {
      return NextResponse.json({ colors: [] });
    }

    const colors: string[] = JSON.parse(match[0]);

    // Filter valid hex colors
    const validColors = colors.filter((c: string) =>
      typeof c === "string" && /^#[0-9A-Fa-f]{3,6}$/.test(c)
    ).slice(0, 6);

    return NextResponse.json({ colors: validColors });
  } catch (error) {
    console.error("Color extraction error:", error);
    return NextResponse.json({ colors: [], error: "Failed to extract colors" });
  }
}