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
        content: `You are a performance marketing expert for SaaS companies.

Brand Info:
- Product: ${answers.productName}
- Description: ${answers.description}
- Target Customer: ${answers.targetCustomer}
- Brand Voice: ${answers.brandVoice}
- Differentiator: ${answers.differentiator}

Brand Strategy:
${brandStrategy}

Create ad copy for both Google and Meta ads.

Campaign Goal: ${campaignGoal}
Target Audience: ${targetAudience}
Budget Range: ${budget}
Feature to Promote: ${feature}
Destination URL: ${destinationURL || "homepage"}

For Google Ads provide:
- 15 headlines (max 30 chars each)
- 4 descriptions (max 90 chars each)

For Meta Ads provide:
- 5 primary text variants
- 5 headline variants
- 3 CTA options

Format clearly with sections for Google and Meta.`,
      },
    ],
  });

  const result = (response.content[0] as { text: string }).text;
  return NextResponse.json({ result });
}