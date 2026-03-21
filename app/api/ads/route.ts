import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();
export async function POST(req: NextRequest) {
  const { campaignGoal, targetAudience, budget, feature, destinationURL, brandStrategy, answers } = await req.json();
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `You are a paid advertising expert.
Brand Info:
- Product: ${answers.productName}
- Description: ${answers.description}
- Target Customer: ${answers.targetCustomer}
- Brand Voice: ${answers.brandVoice}
- Differentiator: ${answers.differentiator}
Brand Strategy:
${brandStrategy}
Create Google RSA + Meta ad campaigns for goal: ${campaignGoal}
Target audience: ${targetAudience}
Budget: ${budget}
Feature to promote: ${feature}
${destinationURL ? `Destination URL: ${destinationURL}` : ""}

IMPORTANT FORMATTING RULES:
- Do NOT use markdown symbols like **, ##, >, or backticks
- Do NOT wrap content in code blocks
- Use plain text only
- Use CAPS for section headers like GOOGLE ADS, META ADS
- Keep formatting clean and readable`,
      },
    ],
  });
  const result = (response.content[0] as { text: string }).text;
  return NextResponse.json({ result });
}
