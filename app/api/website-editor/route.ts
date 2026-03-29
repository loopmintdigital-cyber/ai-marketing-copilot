import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { currentHTML, editRequest, answers } = await req.json();

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: `You are a web developer editing an existing website for ${answers.productName}.

EDIT REQUEST: ${editRequest}

CURRENT HTML:
${currentHTML}

Apply the requested changes to the HTML. Keep everything else the same.
Return the complete updated HTML starting with <!DOCTYPE html>.
Do not include any explanation or markdown — just the raw HTML.`,
      },
    ],
  });

  let result = (response.content[0] as { text: string }).text;
  result = result.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

  if (!result.startsWith("<!DOCTYPE") && !result.startsWith("<html")) {
    const htmlStart = result.indexOf("<!DOCTYPE");
    if (htmlStart > -1) result = result.substring(htmlStart);
  }

  const message = `✅ Done! I've updated your website — ${editRequest.toLowerCase()}.`;
  return NextResponse.json({ html: result, message });
}
