import Anthropic from "@anthropic-ai/sdk";
import type { Plan } from "@/lib/bcorp/types";

export const runtime = "edge";

type PopulateRequest = {
  orgId: string;
  orgName: string;
  plan: Plan;
  existingData: Record<string, string>;
};

function buildPlanSummary(plan: Plan): string {
  return plan
    .map((a) => {
      const parts = [`- [${a.state.toUpperCase()}] ${a.action_data.title}`];
      if (a.action_data.summary) parts.push(`  Summary: ${a.action_data.summary}`);
      if (a.action_data.impact) parts.push(`  Impact: ${a.action_data.impact}`);
      if (a.action_data.scopes?.length) parts.push(`  Scopes: ${a.action_data.scopes.join(", ")}`);
      if (a.action_data.groups?.themes?.length) parts.push(`  Themes: ${a.action_data.groups.themes.join(", ")}`);
      if (a.action_data.groups?.ghg_categories?.length)
        parts.push(`  GHG Categories: ${a.action_data.groups.ghg_categories.join(", ")}`);
      if (a.action_data.benefits) parts.push(`  Benefits: ${a.action_data.benefits}`);
      return parts.join("\n");
    })
    .join("\n");
}

const SHARED_OUTPUT_RULES = `Return ONLY a JSON object with two keys:
- "data": object with HTML string values for fields you are populating (omit unchanged fields)
- "reasoning": object with a 1-sentence explanation for EVERY field listed

No markdown, no explanation outside the JSON. HTML values must use only <p> and <br> tags — no other HTML.`;

// Company description — one-shot, no plan context, just org name
async function runCompanyDescription(
  client: Anthropic,
  orgName: string,
  existing: string
): Promise<{ data: Record<string, string>; reasoning: Record<string, string> }> {
  if (existing) return { data: {}, reasoning: { company_description: "Field already filled." } };

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: `You are writing a brief company description for a B Corp Climate Action Report.

Write a single short paragraph (2-3 sentences) describing what this company does. Use any knowledge you have about the company. If it's not well known, make a reasonable inference from the name about the sector and nature of the business.

Do not mention employee counts, revenue figures, or anything speculative framed as fact.

${SHARED_OUTPUT_RULES}

Field to populate: company_description`,
    messages: [{ role: "user", content: `Company name: ${orgName}` }]
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  try {
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
  } catch {
    return { data: {}, reasoning: {} };
  }
}

// Actions overview — AI summary of the full plan
async function runActionsOverview(
  client: Anthropic,
  orgName: string,
  planSummary: string,
  existing: string
): Promise<{ data: Record<string, string>; reasoning: Record<string, string> }> {
  if (existing) return { data: {}, reasoning: { actions_overview: "Field already filled." } };

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `You are a sustainability consultant writing the Actions Overview section of a B Corp Climate Action Report for ${orgName}.

Write 2-3 flowing paragraphs summarising the climate action plan:
- Paragraph 1: Introduce the plan's scope (Scope 1&2 and/or Scope 3) and breadth of actions
- Paragraph 2 (if Scope 1&2 actions exist): Summarise direct emissions actions, mention 2-3 example titles, key themes, and qualitative benefits (no percentages or figures)
- Paragraph 3 (if Scope 3 actions exist): Summarise value chain actions, mention prevalent GHG categories, key themes, and qualitative benefits

Rules:
- Use exact action titles, themes, and GHG categories from the plan — no invention
- No bullet points, headers, or formatting — flowing paragraphs only
- No specific figures, percentages, or quantified metrics in benefits
- Use measured language: "potential for", "opportunities to achieve", not absolutes

${SHARED_OUTPUT_RULES}

Field to populate: actions_overview`,
    messages: [{ role: "user", content: `Climate action plan:\n${planSummary || "No actions in plan."}` }]
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  try {
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
  } catch {
    return { data: {}, reasoning: {} };
  }
}

// Actions in progress + actions added — both use plan context
async function runProgressSummaries(
  client: Anthropic,
  orgName: string,
  plan: Plan,
  existingInProgress: string,
  existingAdded: string
): Promise<{ data: Record<string, string>; reasoning: Record<string, string> }> {
  const inProgress = plan.filter((a) => a.state === "in_progress");
  const notStarted = plan.filter((a) => a.state === "not_started");

  const fieldsNeeded: string[] = [];
  if (!existingInProgress) fieldsNeeded.push("actions_in_progress");
  if (!existingAdded) fieldsNeeded.push("actions_added");
  if (fieldsNeeded.length === 0)
    return {
      data: {},
      reasoning: {
        actions_in_progress: "Field already filled.",
        actions_added: "Field already filled."
      }
    };

  const inProgressList = inProgress
    .map((a) => `- ${a.action_data.title} (${a.action_data.groups?.themes?.join(", ") ?? "general"})`)
    .join("\n");

  const addedList = notStarted
    .map((a) => `- ${a.action_data.title} (${a.action_data.groups?.themes?.join(", ") ?? "general"})`)
    .join("\n");

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `You are a sustainability consultant writing progress tracking summaries for a B Corp Climate Action Report for ${orgName}.

${fieldsNeeded.includes("actions_in_progress") ? `For actions_in_progress: Write a concise executive summary (max 250 words, can be shorter) of the in-progress actions. Group by strategic theme where relevant. Describe what actions address, not specific outcomes. Board-level language.` : ""}
${fieldsNeeded.includes("actions_added") ? `For actions_added: Write 1-2 sentences summarising the range of areas covered by actions in the plan that haven't started yet.` : ""}

${SHARED_OUTPUT_RULES}

Fields to populate: ${fieldsNeeded.join(", ")}`,
    messages: [
      {
        role: "user",
        content: `In-progress actions (${inProgress.length}):\n${inProgressList || "None"}\n\nNot-started actions (${notStarted.length}):\n${addedList || "None"}`
      }
    ]
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

  const { orgName, plan, existingData }: PopulateRequest = await req.json();

  const client = new Anthropic({ apiKey });
  const planSummary = buildPlanSummary(plan);

  const [companyDesc, actionsOverview, progressSummaries] = await Promise.all([
    runCompanyDescription(client, orgName, existingData.company_description ?? ""),
    runActionsOverview(client, orgName, planSummary, existingData.actions_overview ?? ""),
    runProgressSummaries(
      client,
      orgName,
      plan,
      existingData.actions_in_progress ?? "",
      existingData.actions_added ?? ""
    )
  ]);

  const data = { ...companyDesc.data, ...actionsOverview.data, ...progressSummaries.data };
  const reasoning = { ...companyDesc.reasoning, ...actionsOverview.reasoning, ...progressSummaries.reasoning };

  return Response.json({ data, reasoning });
}
