import Anthropic from "@anthropic-ai/sdk";
import { runActionsOverview } from "@/lib/bcorp/populate/runners/actions-overview";
import { runCompanyDescription } from "@/lib/bcorp/populate/runners/company-description";
import { runProgressSummaries } from "@/lib/bcorp/populate/runners/progress-summaries";
import type { LlmResult, PopulateRequest } from "@/lib/bcorp/populate/types";

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });

  const { orgName, plan, existingData, fieldsToPopulate }: PopulateRequest = await req.json();
  const client = new Anthropic({ apiKey });

  const skip = (): LlmResult => ({ data: {}, reasoning: {} });
  const wants = (field: string) => !fieldsToPopulate || fieldsToPopulate.includes(field);

  const [companyDesc, actionsOverview, progressSummaries] = await Promise.all([
    wants("company_description")
      ? runCompanyDescription(client, orgName, existingData.company_description ?? "")
      : skip(),
    wants("actions_overview") ? runActionsOverview(client, orgName, plan, existingData.actions_overview ?? "") : skip(),
    wants("actions_in_progress") || wants("actions_added")
      ? runProgressSummaries(
          client,
          orgName,
          plan,
          existingData.actions_in_progress ?? "",
          existingData.actions_added ?? "",
          fieldsToPopulate ? ["actions_in_progress", "actions_added"].filter((f) => !wants(f)) : []
        )
      : skip()
  ]);

  const data = { ...companyDesc.data, ...actionsOverview.data, ...progressSummaries.data };
  const reasoning = { ...companyDesc.reasoning, ...actionsOverview.reasoning, ...progressSummaries.reasoning };

  return Response.json({ data, reasoning });
}
