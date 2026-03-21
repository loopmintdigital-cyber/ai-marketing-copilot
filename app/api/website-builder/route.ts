import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();
export async function POST(req: NextRequest) {
  const { answers, brandStrategy, style, pages } = await req.json();
  const styleGuide = {
    modern: "Clean white/light background, minimal design, lots of whitespace, subtle shadows, rounded corners",
    bold: "Dark background (#0a0a0a), purple/pink gradients, glowing effects, dramatic typography, particle-like decorations",
    professional: "White background, blue/navy accents, corporate feel, trust-building design, clean grid layout",
  }[style as keyof typeof styleGuide] || "modern";
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: `You are an expert web designer. Create a complete, beautiful, production-ready HTML website.
BRAND INFO:
- Product Name: ${answers.productName}
- Description: ${answers.description}
- Target Customer: ${answers.targetCustomer}
- Competitors: ${answers.competitors}
- Differentiator: ${answers.differentiator}
- Brand Voice: ${answers.brandVoice}
BRAND STRATEGY:
${brandStrategy}
STYLE: ${styleGuide}
PAGE TYPE: ${pages}
REQUIREMENTS:
- Write COMPLETE HTML in a single file with inline CSS and vanilla JS
- Include a navigation bar with logo and CTA button
- Include a hero section with headline, subheadline and CTA buttons
- Include a features/benefits section with icons (use emojis)
- Include a social proof / stats section
- Include a CTA section at the bottom
- Include a footer
- Make it fully responsive with mobile support
- Use Google Fonts (import from googleapis)
- Make it visually stunning and professional
- Use the brand voice throughout all copy
- All copy must be specific to ${answers.productName} — no placeholder text
- Include smooth scroll behavior
- Add subtle hover animations on buttons and cards
IMPORTANT: Return ONLY the complete HTML code starting with <!DOCTYPE html> — no explanation, no markdown, no backticks.`,
      },
    ],
  });
  const result = (response.content[0] as { text: string }).text;
  const cleanHTML = result.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();
  return NextResponse.json({ result: cleanHTML });
}
