import Anthropic from "@anthropic-ai/sdk";
import type { Plan } from "@/lib/bcorp/types";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are a sustainability data assistant helping populate a B Corp Climate Action Report.
You will be given a company's climate action plan (list of actions with titles, summaries, and states).
Based on this data, infer and populate the B Corp report fields where possible.

Return ONLY a JSON object with string values for the fields you can confidently populate.
Only include fields where you have reasonable evidence from the plan data.
Do not invent specific numbers or dates — leave those empty if not inferable.

Available fields:
- company_description: A one paragraph summary of the company
- cert_bcorp: "yes" or "no"
- cert_iso14001: "yes" or "no"
- initiative_smech: "yes" or "no" (SME Climate Hub)
- initiative_sbti: "yes" or "no" (Science Based Target SBTi)
- reporting_cdp: "yes" or "no"
- rating_ecovadis: "yes" or "no"
- rating_ecovadis_level: level string if known
- policy_procurement: "yes" or "no"
- policy_supplier_code: "yes" or "no"
- policy_travel: "yes" or "no"
- policy_environment: "yes" or "no"
- target_scope12_interim: e.g. "Reduce by 50% by 2030"
- target_scope12_longterm: e.g. "Net zero by 2050"
- target_scope3_interim: e.g. "Reduce by 30% by 2030"
- target_scope3_longterm: e.g. "Net zero by 2050"
- target_baseline_year: year string
- target_baseline_emissions: tCO2e value string`;

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
      const parts = [`- ${a.action_data.title} (${a.state})`];
      if (a.action_data.summary) parts.push(`  Summary: ${a.action_data.summary}`);
      if (a.action_data.impact) parts.push(`  Impact: ${a.action_data.impact}`);
      return parts.join("\n");
    })
    .join("\n");

  const userMessage = `Organisation: ${orgName}

Climate action plan (${plan.length} actions):
${planSummary || "No actions in plan."}

Existing data (already filled — only suggest changes if you have strong evidence):
${JSON.stringify(existingData, null, 2)}

Populate the B Corp report fields based on this data.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }]
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  // Extract JSON from response (may be wrapped in ```json ... ```)
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ?? text.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) {
    return Response.json({ error: "Could not parse model response", raw: text }, { status: 502 });
  }

  const populated: Record<string, string> = JSON.parse(jsonMatch[1]);
  return Response.json({ data: populated });
}
