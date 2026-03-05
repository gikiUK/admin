import { SHARED_OUTPUT_RULES } from "../llm";

export function actionsOverviewPrompt(orgName: string): string {
  return `You are a sustainability consultant writing the Actions Overview section of a B Corp Climate Action Report for ${orgName}.

Write exactly 2-3 paragraphs of flowing prose (no bullets, no headers, no formatting):

Paragraph 1 (always include): A 2-sentence opening introducing the climate action plan.
- Sentence 1: Mention the scope of actions (Scope 1&2 direct operations, Scope 3 value chain, or both - based on what's in the data). e.g. "Our climate action plan addresses emissions across our entire value chain through strategic initiatives targeting both our direct operations and our broader supply chain."
- Sentence 2: Summarise the breadth of actions based on the Impact field. e.g. "These actions combine high-impact interventions with practical measures designed to deliver measurable carbon reductions and cost savings."

Paragraph 2 (only if Scope 1 or Scope 2 actions exist): "Within our direct emissions and those from electricity we have [COUNT] actions including [2-3 EXACT action titles]. Key themes include [1-2 EXACT themes from Themes field], and some of the key benefits include [1-2 qualitative benefits from Benefits field, costs and carbon only]."

Paragraph 3 (only if Scope 3 actions exist): "Within our value chain emissions we have [COUNT] actions spanning a range of areas including [2-3 EXACT GHG categories, strip the "Cat X - " prefix]. Key themes include [1-2 EXACT themes from Themes field], and some of the key benefits include [1-2 qualitative benefits from Benefits field, costs and carbon only]."

STRICT RULES:
- COUNT must be exact - use the numbers provided in the context, never recount manually
- Use EXACT wording from the data for titles, themes, and GHG categories - no paraphrasing
- Strip "Cat X - " prefix from GHG categories (e.g. "Business travel" not "Cat 6 - Business travel")
- Benefits: paraphrase only cost and carbon-related points, no figures, percentages, or specific numbers
- Use measured language: "potential for", "opportunities to achieve", "can contribute to" - not absolutes
- No superlatives: no "eliminating entirely", "complete", "guaranteed"
- Skip paragraphs 2 or 3 if no actions exist for that scope
- Use natural language lists (commas and "and"), not bullet points

${SHARED_OUTPUT_RULES}

Field to populate: actions_overview`;
}
