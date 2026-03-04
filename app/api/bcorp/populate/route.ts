import Anthropic from "@anthropic-ai/sdk";
import { runActionsOverview } from "@/lib/bcorp/populate/runners/actions-overview";
import { runCompanyDescription } from "@/lib/bcorp/populate/runners/company-description";
import { runProgressSummaries } from "@/lib/bcorp/populate/runners/progress-summaries";
import type { PopulateRequest } from "@/lib/bcorp/populate/types";

export const runtime = "edge";

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });

  const { orgName, plan, existingData }: PopulateRequest = await req.json();
  const client = new Anthropic({ apiKey });

  const [companyDesc, actionsOverview, progressSummaries] = await Promise.all([
    runCompanyDescription(client, orgName, existingData.company_description ?? ""),
    runActionsOverview(client, orgName, plan, existingData.actions_overview ?? ""),
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
