import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { answers, brandStrategy, style, pages } = await req.json();

  const styleGuide: Record<string, string> = {
    modern: "Clean white background, minimal design, lots of whitespace, subtle shadows, rounded corners, blue/purple accents",
    bold: "Dark background #0a0a0a, purple and pink gradients, glowing effects, dramatic typography",
    professional: "White background, navy blue accents, corporate feel, trust-building design, clean grid layout",
  };

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: `Create a complete single-file HTML website for ${answers.productName}.

BRAND INFO:
- Product: ${answers.productName}
- Description: ${answers.description}
- Target Customer: ${answers.targetCustomer}
- Differentiator: ${answers.differentiator}
- Brand Voice: ${answers.brandVoice}
- Competitors: ${answers.competitors}

STYLE: ${styleGuide[style] || styleGuide.modern}
PAGE TYPE: ${pages}

Write a complete HTML file with:
1. Navigation bar with logo and CTA button
2. Hero section with big headline and subheadline
3. Features section with 3-6 features using emojis as icons
4. Stats/social proof section
5. CTA section
6. Footer

Rules:
- Use inline CSS only (no external stylesheets except Google Fonts)
- Import Google Fonts at the top
- Make it mobile responsive
- All text must be specific to ${answers.productName} — NO placeholder text
- Use the brand voice: ${answers.brandVoice}
- Make it visually stunning

VERY IMPORTANT: Reply with ONLY the raw HTML starting with <!DOCTYPE html>
Do not include any explanation, markdown, or code blocks.
Start your response with exactly: <!DOCTYPE html>`,
      },
    ],
  });

  let result = (response.content[0] as { text: string }).text;
  // Clean any accidental markdown
  result = result.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  
  if (!result.startsWith("<!DOCTYPE") && !result.startsWith("<html")) {
    const htmlStart = result.indexOf("<!DOCTYPE");
    if (htmlStart > -1) result = result.substring(htmlStart);
  }

  return NextResponse.json({ result });
}
