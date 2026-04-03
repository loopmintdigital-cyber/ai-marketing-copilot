import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { topic, size, style, brandColors, answers, brandStrategy } = await req.json();

    const primary = brandColors[0] || "#7c3aed";
    const secondary = brandColors[1] || "#ec4899";
    const accent = brandColors[2] || "#3b82f6";

    const styleGuides: Record<string, string> = {
      bold: "Bold dramatic background with geometric shapes, strong gradients, NO text at all",
      minimal: "Clean minimal background, subtle texture or gradient, very simple, NO text",
      gradient: "Beautiful smooth gradient background using brand colors, NO text",
      dark: "Dark luxury background (#111 or darker), subtle geometric elements, NO text",
      neon: "Dark background with neon glow effects using brand colors, electric feel, NO text",
      magazine: "Magazine-style background layout with color blocks and lines, NO text",
    };

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{
        role: "user",
        content: `Create a social media poster BACKGROUND as a complete HTML file.

IMPORTANT: Generate ONLY the visual background design — NO TEXT ELEMENTS AT ALL.
The text will be added separately as overlay layers.

POSTER DETAILS:
- Topic/Theme: ${topic}
- Brand: ${answers.productName || "Brand"}
- Size: ${size.w}x${size.h}px
- Style: ${styleGuides[style] || styleGuides.bold}
- Primary Color: ${primary}
- Secondary Color: ${secondary}
- Accent Color: ${accent}

STRICT REQUIREMENTS:
1. NO <p>, <h1>, <h2>, <h3>, <span>, <button>, <a> tags with text content
2. ONLY visual elements: backgrounds, gradients, geometric shapes (div elements), lines, circles
3. Complete HTML file with <!DOCTYPE html><html><head><body>
4. body { margin: 0; padding: 0; width: ${size.w}px; height: ${size.h}px; overflow: hidden; }
5. Use brand colors for backgrounds and shapes
6. Add decorative geometric div elements (circles, rectangles, diagonal lines)
7. Make it look like a PREMIUM poster background
8. NO text-shadow, NO text effects, NO font imports needed

After the complete HTML background, write "---LAYERS---" then provide the text content as JSON:
{
  "headline": "Main bold headline text (2-4 words)",
  "subheadline": "Secondary line (4-6 words)", 
  "body": "Short body text (8-12 words)",
  "cta": "Call to action button text (2-3 words)",
  "caption": "Full social media caption 2-3 sentences",
  "hashtags": "15-20 hashtags starting with #",
  "keywords": "8-10 SEO keywords comma separated"
}`,
      }],
    });

    const fullText = message.content[0].type === "text" ? message.content[0].text : "";
    const parts = fullText.split("---LAYERS---");

    let html = parts[0].trim();
    // Clean markdown fences
    const htmlMatch = html.match(/```html\n?([\s\S]*?)\n?```/);
    if (htmlMatch) html = htmlMatch[1].trim();

    // Parse layers JSON
    let layersData = { headline: "", subheadline: "", body: "", cta: "", caption: "", hashtags: "", keywords: "" };
    if (parts[1]) {
      const jsonMatch = parts[1].match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { layersData = { ...layersData, ...JSON.parse(jsonMatch[0]) }; } catch {}
      }
    }

    // Fallback content if AI didn't generate
    if (!layersData.headline) layersData.headline = topic.split(" ").slice(0, 3).join(" ").toUpperCase();
    if (!layersData.subheadline) layersData.subheadline = answers.productName || "Your Brand";
    if (!layersData.body) layersData.body = "Experience the difference today";
    if (!layersData.cta) layersData.cta = "DISCOVER NOW";
    if (!layersData.caption) layersData.caption = `${topic} — ${answers.productName || "Our Brand"} is here. Don't miss out! 🚀`;
    if (!layersData.hashtags) layersData.hashtags = `#${answers.productName?.replace(/\s/g, "") || "Brand"} #Marketing #Business`;
    if (!layersData.keywords) layersData.keywords = `${topic}, marketing, brand`;

    return NextResponse.json({
      html,
      layers: layersData,
      caption: layersData.caption,
      hashtags: layersData.hashtags,
      keywords: layersData.keywords,
    });
  } catch (error) {
    console.error("Poster generation error:", error);
    return NextResponse.json({ error: "Failed to generate poster" }, { status: 500 });
  }
}