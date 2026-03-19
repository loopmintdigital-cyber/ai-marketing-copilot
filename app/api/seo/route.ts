import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { productCategory, targetKeywords, competitorDomains, articleTopic, brandStrategy, answers } = await req.json();

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `You are an SEO and content marketing expert for SaaS companies.

Brand Info:
- Product: ${answers.productName}
- Description: ${answers.description}
- Target Customer: ${answers.targetCustomer}
- Brand Voice: ${answers.brandVoice}

Brand Strategy:
${brandStrategy}

Product Category: ${productCategory}
Target Keywords: ${targetKeywords || "not specified"}
Competitor Domains: ${competitorDomains || "not specified"}
Article Topic: ${articleTopic}

Provide:
1. Keyword cluster map (10 related keywords with search intent)
2. 3-month blog calendar (12 article titles with target keywords)
3. Full SEO-optimized article for "${articleTopic}" (1500-2000 words)
4. Meta title and description
5. 5 internal link suggestions

Format each section clearly with headers.`,
      },
    ],
  });

  const result = (response.content[0] as { text: string }).text;
  return NextResponse.json({ result });
}