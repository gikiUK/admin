import type Anthropic from "@anthropic-ai/sdk";
import type { Plan } from "@/lib/bcorp/types";
import { extractText, parseJsonResponse } from "../llm";
import { buildActionsOverviewContext } from "../plan-context";
import { actionsOverviewPrompt } from "../prompts/actions-overview";
import type { LlmResult } from "../types";

export async function runActionsOverview(
  client: Anthropic,
  orgName: string,
  plan: Plan,
  existing: string
): Promise<LlmResult> {
  if (existing) return { data: {}, reasoning: { actions_overview: "Field already filled." } };

  const context = buildActionsOverviewContext(plan);

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: actionsOverviewPrompt(orgName),
    messages: [{ role: "user", content: context || "No scoped actions in plan." }]
  });

  return parseJsonResponse(extractText(msg));
}
