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
      bold: "Bold typography with large impactful text, strong contrast, geometric shapes as decorative elements",
      minimal: "Clean white space, thin elegant fonts, minimal elements, sophisticated layout",
      gradient: "Beautiful gradient background using brand colors smoothly blended",
      dark: "Very dark background (#111 or #0a0a0a), light text, luxury premium feel",
      simple: "Flat design, simple shapes, clear hierarchy, clean and easy to read",
    };

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: `Create a stunning social media poster as a complete self-contained HTML file.

POSTER DETAILS:
- Topic: ${topic}
- Brand Name: ${answers.productName || "Brand"}
- Size: ${size.w}x${size.h}px
- Style: ${styleGuides[style] || styleGuides.bold}
- Primary Color: ${primary}
- Secondary Color: ${secondary}
- Accent Color: ${accent}
- Brand Voice: ${answers.brandVoice || "Professional"}

CRITICAL RULES FOR PDF COMPATIBILITY:
1. NEVER use text-shadow CSS property - it causes doubled text in PDF
2. NEVER use -webkit-text-stroke or text-stroke
3. NEVER use mix-blend-mode
4. NEVER duplicate text elements to create effects
5. Use solid colors only for text (no gradients on text via background-clip)
6. Use background gradients on divs/containers ONLY, not on text
7. Keep all text as plain colored text - use font-weight and font-size for impact instead

DESIGN REQUIREMENTS:
- Complete HTML file with <!DOCTYPE html><html><head><body> tags
- Body exactly ${size.w}px wide and ${size.h}px tall, overflow:hidden, margin:0
- Import ONE Google Font using @import url() in <style> tag
- Use brand colors for backgrounds, borders, buttons, accents
- Create decorative elements using CSS (circles, rectangles, lines) as div elements
- Leave space in top-left corner (60x60px) for logo placeholder with id="logo-area"
- The poster MUST look professional and print-clean
- Use position:absolute for layout elements
- Add a subtle geometric pattern or shapes using CSS

LOGO PLACEHOLDER:
Add this exactly in your HTML where the logo should appear:
<div id="logo-area" style="position:absolute;top:24px;left:24px;width:120px;height:60px;display:flex;align-items:center;"></div>

After the complete HTML, write exactly "---CAPTION---" then write a compelling 2-3 sentence social media caption.
Then write "---HASHTAGS---" followed by 15-20 relevant hashtags starting with #.
Then write "---KEYWORDS---" followed by 8-10 SEO keywords separated by commas.`,
      }],
    });

    const fullText = message.content[0].type === "text" ? message.content[0].text : "";

    const parts = fullText.split("---CAPTION---");
    let html = parts[0].trim();

    // Clean markdown code fences if present
    const htmlMatch = html.match(/```html\n?([\s\S]*?)\n?```/);
    if (htmlMatch) html = htmlMatch[1].trim();

    let caption = "";
    let hashtags = "";
    let keywords = "";

    if (parts[1]) {
      const afterCaption = parts[1].split("---HASHTAGS---");
      caption = afterCaption[0].trim();
      if (afterCaption[1]) {
        const afterHashtags = afterCaption[1].split("---KEYWORDS---");
        hashtags = afterHashtags[0].trim();
        keywords = afterHashtags[1]?.trim() || "";
      }
    }

    if (!caption) caption = `${topic} — ${answers.productName || "Our Brand"} is making waves. Don't miss out! 🚀`;
    if (!hashtags) hashtags = `#${answers.productName?.replace(/\s/g, "") || "Brand"} #Marketing #Business #Growth #Fashion #Style`;
    if (!keywords) keywords = `${topic}, ${answers.productName || "brand"}, marketing, social media, business`;

    return NextResponse.json({ html, caption, hashtags, keywords });
  } catch (error) {
    console.error("Poster generation error:", error);
    return NextResponse.json({ error: "Failed to generate poster" }, { status: 500 });
  }
}