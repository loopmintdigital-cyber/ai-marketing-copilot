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
      bold: "Bold typography, high contrast, strong shadows, dramatic layout, large impactful text",
      minimal: "Clean white space, thin fonts, minimal elements, elegant spacing, sophisticated",
      gradient: "Beautiful gradient backgrounds, smooth color transitions, modern glow effects",
      dark: "Dark background, luxury feel, gold/light accents, premium aesthetic",
      simple: "Flat design, simple shapes, clear hierarchy, easy to read",
    };

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

DESIGN REQUIREMENTS:
- Create a COMPLETE HTML file with inline CSS only
- The poster must be exactly ${size.w}px wide and ${size.h}px tall
- Use the brand colors prominently
- Make it look PROFESSIONAL and STUNNING
- Include the brand name "${answers.productName || "Brand"}" 
- Create compelling headline text related to the topic
- Add visual elements using CSS (gradients, shapes, borders)
- No external images needed - use CSS for all visuals
- Font: Use Google Fonts (import in <style>)
- Make it visually impressive with creative layout

After the HTML, on a new line write "---CAPTION---" then write:
- An engaging social media caption (2-3 sentences) for this poster
- Write "---HASHTAGS---" then 15-20 relevant hashtags
- Write "---KEYWORDS---" then 8-10 SEO keywords separated by commas

Return the complete HTML first, then the caption/hashtags/keywords sections.`,
      }],
    });

    const fullText = message.content[0].type === "text" ? message.content[0].text : "";

    // Split HTML from caption/hashtags/keywords
    const parts = fullText.split("---CAPTION---");
    const html = parts[0].trim();

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

    // If no caption was generated, create defaults
    if (!caption) {
      caption = `${topic} — ${answers.productName || "Our Brand"} is here to make a difference. Check out our latest update and join the movement! 🚀`;
    }
    if (!hashtags) {
      hashtags = `#${answers.productName?.replace(/\s/g, "") || "Brand"} #Marketing #Business #Growth #Innovation`;
    }
    if (!keywords) {
      keywords = `${topic}, ${answers.productName || "brand"}, marketing, social media, business`;
    }

    return NextResponse.json({ html, caption, hashtags, keywords });
  } catch (error) {
    console.error("Poster generation error:", error);
    return NextResponse.json({ error: "Failed to generate poster" }, { status: 500 });
  }
}