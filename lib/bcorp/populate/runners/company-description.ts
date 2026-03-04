import type Anthropic from "@anthropic-ai/sdk";
import { extractText, parseJsonResponse } from "../llm";
import { companyDescriptionPrompt } from "../prompts/company-description";
import type { LlmResult } from "../types";

export async function runCompanyDescription(client: Anthropic, orgName: string, existing: string): Promise<LlmResult> {
  if (existing) return { data: {}, reasoning: { company_description: "Field already filled." } };

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: companyDescriptionPrompt(),
    messages: [{ role: "user", content: `Company name: ${orgName}` }]
  });

  return parseJsonResponse(extractText(msg));
}
