import type Anthropic from "@anthropic-ai/sdk";
import type { LlmResult } from "./types";

export const SHARED_OUTPUT_RULES = `Return ONLY a JSON object with two keys:
- "data": object with plain text string values for fields you are populating (omit unchanged fields). Use double newlines to separate paragraphs. No HTML tags.
- "reasoning": object with a 1-sentence explanation for EVERY field listed

No markdown formatting, no explanation outside the JSON.`;

export function extractText(msg: Anthropic.Message): string {
  return msg.content[0].type === "text" ? msg.content[0].text : "";
}

export function parseJsonResponse(text: string): LlmResult {
  try {
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
  } catch {
    return { data: {}, reasoning: {} };
  }
}
