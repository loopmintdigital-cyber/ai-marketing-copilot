import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { topic, size, style, brandColors, answers, brandStrategy, logoBase64 } = await req.json();

    const primary = brandColors[0] || "#7c3aed";
    const secondary = brandColors[1] || "#ec4899";
    const accent = brandColors[2] || "#3b82f6";

    const styleGuides: Record<string, string> = {
      bold: "Bold typography, high contrast, strong shadows, dramatic layout, large impactful text",
      minimal: "Clean white space, thin fonts, minimal elements, elegant spacing, sophisticated",
      gradient: "Beautiful gradient backgrounds using the brand colors, smooth color transitions, modern glow effects",
      dark: "Very dark background (#0a0a0a or similar), luxury feel, light text, premium aesthetic",
      simple: "Flat design, simple shapes, clear hierarchy, easy to read, clean layout",
    };

    const logoInstruction = logoBase64
      ? `IMPORTANT: Include the brand logo image in the poster using this base64 data URL: "${logoBase64.substring(0, 50)}..." (use the full base64 string provided). Place it prominently at the top or corner of the poster using an <img> tag with src="${logoBase64}". Make it look professional - give it appropriate width/height and position it well in the layout.`
      : `No logo provided. Use text-based brand name "${answers.productName || "Brand"}" as the logo/brand identifier.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: `Create a stunning social media poster as a complete self-contained HTML file.

POSTER DETAILS:
- Topic: ${topic}
- Brand: ${answers.productName || "Brand"}
- Size: ${size.w}x${size.h}px
- Style: ${styleGuides[style] || styleGuides.bold}
- Primary Color: ${primary}
- Secondary Color: ${secondary}
- Accent Color: ${accent}
- Brand Voice: ${answers.brandVoice || "Professional"}
- Target Customer: ${answers.targetCustomer || "General audience"}

LOGO: ${logoInstruction}

DESIGN REQUIREMENTS:
- Create a COMPLETE HTML file with <!DOCTYPE html>, <html>, <head>, <body> tags
- The poster body must be exactly ${size.w}px wide and ${size.h}px tall with NO scrollbars
- Use the brand colors prominently throughout
- Make it look STUNNING and PROFESSIONAL
- Create a compelling headline related to the topic
- Add visual elements using CSS only (gradients, shapes, borders, geometric elements)
- Import Google Fonts for typography (use @import in <style>)
- Make it visually impressive - this should look like a real brand poster
- body { margin: 0; padding: 0; overflow: hidden; width: ${size.w}px; height: ${size.h}px; }
- Use position: absolute/relative for layout, not flexbox alone
- Add subtle geometric shapes, lines, or decorative elements

After the HTML, write exactly "---CAPTION---" then:
A compelling 2-3 sentence social media caption for this poster.

Then write "---HASHTAGS---" followed by 15-20 relevant hashtags starting with #.

Then write "---KEYWORDS---" followed by 8-10 SEO keywords separated by commas.`,
      }],
    });

    const fullText = message.content[0].type === "text" ? message.content[0].text : "";

    const parts = fullText.split("---CAPTION---");
    let html = parts[0].trim();

    // Clean up HTML - extract just the HTML if wrapped in markdown
    const htmlMatch = html.match(/```html\n?([\s\S]*?)\n?```/);
    if (htmlMatch) html = htmlMatch[1].trim();

    // Inject logo if provided and not already in HTML
    if (logoBase64 && !html.includes(logoBase64.substring(0, 20))) {
      html = html.replace(
        /<body[^>]*>/,
        `$&<img src="${logoBase64}" style="position:absolute;top:30px;left:30px;max-width:120px;max-height:60px;object-fit:contain;z-index:100;" alt="logo" />`
      );
    }

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
    if (!hashtags) hashtags = `#${answers.productName?.replace(/\s/g, "") || "Brand"} #Marketing #Business #Growth`;
    if (!keywords) keywords = `${topic}, ${answers.productName || "brand"}, marketing, social media`;

    return NextResponse.json({ html, caption, hashtags, keywords });
  } catch (error) {
    console.error("Poster generation error:", error);
    return NextResponse.json({ error: "Failed to generate poster" }, { status: 500 });
  }
}