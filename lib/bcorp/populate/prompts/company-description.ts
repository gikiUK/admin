import { SHARED_OUTPUT_RULES } from "../llm";

export function companyDescriptionPrompt(): string {
  return `You are writing a brief company description for a B Corp Climate Action Report.

Write a single short paragraph (2-3 sentences) describing what this company does. Use any knowledge you have about the company. If it's not well known, make a reasonable inference from the name about the sector and nature of the business.

Do not mention employee counts, revenue figures, or anything speculative framed as fact.

${SHARED_OUTPUT_RULES}

Field to populate: company_description`;
}
