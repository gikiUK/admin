import type Anthropic from "@anthropic-ai/sdk";
import type { Plan } from "@/lib/bcorp/types";
import { extractText, parseJsonResponse } from "../llm";
import { progressSummariesPrompt } from "../prompts/progress-summaries";
import type { LlmResult } from "../types";

export async function runProgressSummaries(
  client: Anthropic,
  orgName: string,
  plan: Plan,
  existingInProgress: string,
  existingAdded: string
): Promise<LlmResult> {
  const fieldsNeeded: string[] = [];
  if (!existingInProgress) fieldsNeeded.push("actions_in_progress");
  if (!existingAdded) fieldsNeeded.push("actions_added");

  if (fieldsNeeded.length === 0) {
    return {
      data: {},
      reasoning: { actions_in_progress: "Field already filled.", actions_added: "Field already filled." }
    };
  }

  const inProgress = plan.filter((a) => a.state === "in_progress");
  const notStarted = plan.filter((a) => a.state === "not_started");

  const inProgressList = inProgress
    .map((a) => `- ${a.action_data.title} (${a.action_data.groups?.themes?.join(", ") ?? "general"})`)
    .join("\n");

  const addedList = notStarted
    .map((a) => `- ${a.action_data.title} (${a.action_data.groups?.themes?.join(", ") ?? "general"})`)
    .join("\n");

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: progressSummariesPrompt(orgName, fieldsNeeded),
    messages: [
      {
        role: "user",
        content: `In-progress actions (${inProgress.length}):\n${inProgressList || "None"}\n\nNot-started actions (${notStarted.length}):\n${addedList || "None"}`
      }
    ]
  });

  return parseJsonResponse(extractText(msg));
}
