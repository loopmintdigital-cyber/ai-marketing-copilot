import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { messages, brandStrategy, answers } = await req.json();
  
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
  const isWebsiteRequest = lastMessage.includes("website") || lastMessage.includes("landing page") || lastMessage.includes("webpage") || lastMessage.includes("build me a") || lastMessage.includes("create a site");

  const systemPrompt = `You are an elite AI marketing expert for ${answers.productName}.

BRAND PROFILE:
- Product: ${answers.productName}
- Description: ${answers.description}
- Target Customer: ${answers.targetCustomer}
- Competitors: ${answers.competitors}
- Differentiator: ${answers.differentiator}
- Brand Voice: ${answers.brandVoice}

FULL BRAND STRATEGY:
${brandStrategy}

YOU CAN HELP WITH:
1. SOCIAL MEDIA — LinkedIn, Twitter, Instagram posts and calendars
2. EMAIL MARKETING — sequences, subject lines, cold outreach
3. AD CAMPAIGNS — Google RSA, Meta ad copy with A/B variants
4. SEO & BLOG — articles, keyword strategies, blog calendars
5. COPYWRITING — landing pages, hero copy, feature copy
6. BRAND STRATEGY — positioning, taglines, ICP personas
7. WEBSITE — full HTML website generation

${isWebsiteRequest ? `
WEBSITE REQUEST DETECTED:
The user wants a website. Generate a complete HTML website for ${answers.productName}.
Return the full HTML starting with <!DOCTYPE html>.
After the HTML, add this exact line on a new line: [WEBSITE_GENERATED]
This signals to the UI to show a preview button.
` : ""}

RULES:
- Always write in ${answers.brandVoice} brand voice
- Always reference ${answers.productName} specifically  
- Do NOT use markdown symbols like **, ##, >, or backticks in regular responses
- Use plain text with CAPS for headers
- Be concise, actionable and specific
- Generate content immediately without asking clarifying questions`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    system: systemPrompt,
    messages: messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
  });
  
  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const isWebsite = text.includes("[WEBSITE_GENERATED]") || (text.includes("<!DOCTYPE") && isWebsiteRequest);
  const htmlMatch = text.match(/<!DOCTYPE html[\s\S]*<\/html>/i);
  const html = htmlMatch ? htmlMatch[0] : "";
  const displayText = isWebsite ? "✅ Website generated! Click the button below to preview and download it." : text;

  return NextResponse.json({ result: displayText, html: html, isWebsite });
}
