import { SHARED_OUTPUT_RULES } from "../llm";

export function progressSummariesPrompt(orgName: string, fieldsNeeded: string[]): string {
  const inProgressInstruction = fieldsNeeded.includes("actions_in_progress")
    ? `For actions_in_progress: Write a concise executive summary (max 250 words, can be shorter) of the in-progress actions. Group by strategic theme where relevant. Describe what actions address, not specific outcomes. Board-level language.`
    : "";

  const addedInstruction = fieldsNeeded.includes("actions_added")
    ? `For actions_added: Write 1-2 sentences summarising the range of areas covered by actions in the plan that haven't started yet.`
    : "";

  return `You are a sustainability consultant writing progress tracking summaries for a B Corp Climate Action Report for ${orgName}.

${inProgressInstruction}
${addedInstruction}

${SHARED_OUTPUT_RULES}

Fields to populate: ${fieldsNeeded.join(", ")}`;
}
