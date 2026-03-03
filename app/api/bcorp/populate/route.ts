import Anthropic from "@anthropic-ai/sdk";
import type { Plan } from "@/lib/bcorp/types";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are a sustainability data assistant helping populate a B Corp Climate Action Report for a UK SME.
You will be given a company's climate action plan — a list of actions with titles, summaries, states, and impacts.

Your job is to populate as many fields as possible AND explain your reasoning for every single field.

## Rules

**For yes/no fields:**
- If an action title or summary *directly mentions* the topic (e.g. "Implement a Sustainable Travel Policy" → policy_travel: "yes"), set it to "yes".
- If the plan contains actions that are clearly *not yet started* or *in progress* for something, that still means the company is working toward it — you may set "yes" if the intention is clear.
- If there is genuinely no mention of a topic anywhere in the plan, set it to "no" — do NOT leave it blank.
- Only leave blank ("") if it is truly ambiguous and you cannot make a reasonable determination.

**For text fields (targets, descriptions, baseline):**
- Extract verbatim numbers, years, percentages if mentioned in action summaries or impacts.
- If not explicitly stated, leave blank — do not invent numbers.
- For company_description: write a short paragraph about what the company appears to do based on the action plan context, org name, and any other signals.

**For existing data:**
- Do not change fields that are already filled, unless you have strong contradicting evidence.

## Output format

Return a JSON object with exactly two keys:
- "data": object with string values for fields you are populating (omit fields you are not changing)
- "reasoning": object with a short explanation for EVERY field listed below, whether filled or not

Reasoning should be 1 sentence max. For filled fields: what signal led you to it. For unfilled: what was missing.

Fields to reason about:
company_description, cert_bcorp, cert_iso14001, initiative_smech, initiative_sbti, reporting_cdp,
rating_ecovadis, rating_ecovadis_level, policy_procurement, policy_supplier_code, policy_travel,
policy_environment, target_scope12_interim, target_scope12_longterm, target_scope3_interim,
target_scope3_longterm, target_baseline_year, target_baseline_emissions`;

type PopulateRequest = {
  orgName: string;
  plan: Plan;
  existingData: Record<string, string>;
};

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const { orgName, plan, existingData }: PopulateRequest = await req.json();

  const client = new Anthropic({ apiKey });

  const planSummary = plan
    .map((a) => {
      const parts = [`- [${a.state.toUpperCase()}] ${a.action_data.title}`];
      if (a.action_data.summary) parts.push(`  Summary: ${a.action_data.summary}`);
      if (a.action_data.impact) parts.push(`  Impact: ${a.action_data.impact}`);
      if (a.action_data.complexity) parts.push(`  Complexity: ${a.action_data.complexity}`);
      return parts.join("\n");
    })
    .join("\n");

  const filledKeys = Object.entries(existingData)
    .filter(([, v]) => v !== "")
    .map(([k]) => k);

  const userMessage = `Organisation: ${orgName}

Climate action plan (${plan.length} actions):
${planSummary || "No actions in plan."}

Already filled fields (do not overwrite unless you have strong contradicting evidence):
${filledKeys.length ? filledKeys.join(", ") : "none"}

Current values:
${JSON.stringify(existingData, null, 2)}

Populate the fields and provide reasoning for all fields.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }]
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ?? text.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) {
    return Response.json({ error: "Could not parse model response", raw: text }, { status: 502 });
  }

  const parsed: { data: Record<string, string>; reasoning: Record<string, string> } = JSON.parse(jsonMatch[1]);
  return Response.json({ data: parsed.data ?? {}, reasoning: parsed.reasoning ?? {} });
}
