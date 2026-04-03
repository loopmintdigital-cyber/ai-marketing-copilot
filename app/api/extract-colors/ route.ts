import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http")) targetUrl = "https://" + targetUrl;

    // Use allorigins proxy to bypass CORS restrictions
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    const response = await fetch(proxyUrl, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json({ colors: [], error: "Could not fetch website" });
    }

    const proxyData = await response.json();
    const html: string = proxyData.contents || "";

    if (!html || html.length < 100) {
      return NextResponse.json({ colors: [], error: "Website returned empty content" });
    }

    // Extract CSS and style content for better color detection
    const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
    const inlineStyles = html.match(/style="([^"]*)"/gi) || [];
    const cssContent = [...styleMatches, ...inlineStyles].join(" ");

    // Use Claude to extract colors
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Extract the main brand colors from this website's HTML/CSS. Look for:
- CSS custom properties (--color-*, --primary, --brand, etc.)
- Background colors on hero sections, buttons, navbars
- Text colors for headings
- Border/accent colors

CSS content:
${cssContent.slice(0, 5000)}

HTML snippet:
${html.slice(0, 3000)}

Return ONLY a valid JSON array of 3-5 hex color codes representing the brand's PRIMARY colors (not just black/white/gray unless it's a monochrome brand).

Example format: ["#7c3aed", "#ec4899", "#3b82f6"]

Return nothing else — just the JSON array.`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";

    // Parse JSON array from response
    const match = text.match(/\[[\s\S]*?\]/);
    if (!match) {
      return NextResponse.json({ colors: [], error: "Could not identify brand colors" });
    }

    const colors: string[] = JSON.parse(match[0]);
    const validColors = colors
      .filter((c: string) => typeof c === "string" && /^#[0-9A-Fa-f]{3,6}$/.test(c.trim()))
      .map((c: string) => c.trim())
      .slice(0, 6);

    if (validColors.length === 0) {
      return NextResponse.json({ colors: [], error: "No valid colors found. Try the Presets or Custom tab." });
    }

    return NextResponse.json({ colors: validColors });
  } catch (error: any) {
    console.error("Color extraction error:", error);
    return NextResponse.json({
      colors: [],
      error: "Failed to read website. Try a well-known site like stripe.com or use Presets.",
    });
  }
}