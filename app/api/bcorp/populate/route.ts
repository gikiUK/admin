import Anthropic from "@anthropic-ai/sdk";
import type { Plan } from "@/lib/bcorp/types";

export const runtime = "edge";

type PopulateRequest = {
  orgId: string;
  plan: Plan;
  existingData: Record<string, string>;
};

function buildPlanSummary(plan: Plan): string {
  return plan
    .map((a) => {
      const parts = [`- [${a.state.toUpperCase()}] ${a.action_data.title}`];
      if (a.action_data.summary) parts.push(`  Summary: ${a.action_data.summary}`);
      if (a.action_data.impact) parts.push(`  Impact: ${a.action_data.impact}`);
      if (a.action_data.complexity) parts.push(`  Complexity: ${a.action_data.complexity}`);
      return parts.join("\n");
    })
    .join("\n");
}

function buildContext(orgName: string, planSummary: string, existingData: Record<string, string>): string {
  const filledKeys = Object.entries(existingData)
    .filter(([, v]) => v !== "")
    .map(([k]) => k);
  return `Organisation: ${orgName}

Climate action plan:
${planSummary || "No actions in plan."}

Already filled (do not overwrite unless strong contradicting evidence): ${filledKeys.length ? filledKeys.join(", ") : "none"}
Current values: ${JSON.stringify(existingData)}`;
}

const SHARED_OUTPUT_RULES = `Return ONLY a JSON object with two keys:
- "data": object with string values for fields you are populating (omit unchanged fields)
- "reasoning": object with a 1-sentence explanation for EVERY field listed, whether filled or not

No markdown, no explanation outside the JSON.`;

// Group A — Sonnet: company description + certifications/initiatives
async function runGroupA(
  client: Anthropic,
  context: string
): Promise<{ data: Record<string, string>; reasoning: Record<string, string> }> {
  const system = `You are a sustainability data assistant populating a B Corp Climate Action Report for a UK SME.

Fields to populate:
- company_description (text): A short paragraph about what the company does, inferred from org name and plan context.
- cert_bcorp (yes/no/""): Is the company B Corp certified?
- cert_iso14001 (yes/no/""): Is the company ISO 14001 certified?
- initiative_smech (yes/no/""): Has the company signed up to SME Climate Hub?
- initiative_sbti (yes/no/""): Does the company have a Science Based Target (SBTi)?
- reporting_cdp (yes/no/""): Does the company report through CDP?
- rating_ecovadis (yes/no/""): Does the company have an Ecovadis rating?
- rating_ecovadis_level (text): Ecovadis rating level — only fill if rating_ecovadis is "yes".

Rules for yes/no:
- "yes" if directly mentioned or clearly implied by an action title/summary.
- "no" if genuinely no mention anywhere in the plan.
- "" only if truly ambiguous.

${SHARED_OUTPUT_RULES}

Fields to reason about: company_description, cert_bcorp, cert_iso14001, initiative_smech, initiative_sbti, reporting_cdp, rating_ecovadis, rating_ecovadis_level`;

  const msg = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system,
    messages: [{ role: "user", content: context }]
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  try {
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
  } catch {
    return { data: {}, reasoning: {} };
  }
}

// Group B — Haiku: yes/no policy fields
async function runGroupB(
  client: Anthropic,
  context: string
): Promise<{ data: Record<string, string>; reasoning: Record<string, string> }> {
  const system = `You are a sustainability data assistant populating a B Corp Climate Action Report for a UK SME.

Fields to populate (all yes/no/""):
- policy_procurement: Does the company have a Sustainable Procurement Policy?
- policy_supplier_code: Does the company have a Supplier Code of Conduct?
- policy_travel: Does the company have a Sustainable Travel Policy?
- policy_environment: Does the company have an Environmental Management Policy?

Rules:
- "yes" if the action title or summary directly mentions or clearly implies the policy exists or is being implemented.
- "no" if there is genuinely no mention of this topic anywhere in the plan.
- "" only if truly ambiguous.

${SHARED_OUTPUT_RULES}

Fields to reason about: policy_procurement, policy_supplier_code, policy_travel, policy_environment`;

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system,
    messages: [{ role: "user", content: context }]
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  try {
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
  } catch {
    return { data: {}, reasoning: {} };
  }
}

// Group C — Haiku: numeric emission target extraction
async function runGroupC(
  client: Anthropic,
  context: string
): Promise<{ data: Record<string, string>; reasoning: Record<string, string> }> {
  const system = `You are a sustainability data assistant populating a B Corp Climate Action Report for a UK SME.

Fields to populate (text, extract verbatim numbers/years/percentages from the plan — do NOT invent):
- target_scope12_interim: Scope 1 & 2 interim reduction target (e.g. "Reduce by 50% by 2030")
- target_scope12_longterm: Scope 1 & 2 long-term target (e.g. "Net zero by 2050")
- target_scope3_interim: Scope 3 interim reduction target
- target_scope3_longterm: Scope 3 long-term target
- target_baseline_year: Baseline year (4-digit year only)
- target_baseline_emissions: Baseline emissions in tCO2e (number only)

If a value is not explicitly stated in the plan, leave it blank ("") — never invent numbers.

${SHARED_OUTPUT_RULES}

Fields to reason about: target_scope12_interim, target_scope12_longterm, target_scope3_interim, target_scope3_longterm, target_baseline_year, target_baseline_emissions`;

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system,
    messages: [{ role: "user", content: context }]
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  try {
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
  } catch {
    return { data: {}, reasoning: {} };
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const { orgId, plan, existingData }: PopulateRequest = await req.json();

  const client = new Anthropic({ apiKey });
  const planSummary = buildPlanSummary(plan);
  const context = buildContext(orgId, planSummary, existingData);

  const [groupA, groupB, groupC] = await Promise.all([
    runGroupA(client, context),
    runGroupB(client, context),
    runGroupC(client, context)
  ]);

  const data = { ...groupA.data, ...groupB.data, ...groupC.data };
  const reasoning = { ...groupA.reasoning, ...groupB.reasoning, ...groupC.reasoning };

  return Response.json({ data, reasoning });
}
