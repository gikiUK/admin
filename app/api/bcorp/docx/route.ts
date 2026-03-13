import { getApiUrl } from "@/lib/api/config";
import { generateBcorpDocx } from "@/lib/bcorp/docx/generate";
import type { BcorpData, Plan } from "@/lib/bcorp/types";

export async function POST(req: Request) {
  try {
    const { orgId, orgName, jwt } = await req.json();

    if (typeof orgId !== "string" || !/^[\w-]+$/.test(orgId)) {
      return new Response("Invalid orgId", { status: 400 });
    }
    if (typeof jwt !== "string" || !jwt) {
      return new Response("Missing JWT token", { status: 400 });
    }

    const headers = { Authorization: `Bearer ${jwt}`, Accept: "application/json" };

    const [bcorpRes, planRes] = await Promise.all([
      fetch(getApiUrl(`/admin/legacy/organizations/${orgId}/bcorp_data`), { headers }),
      fetch(getApiUrl(`/admin/legacy/organizations/${orgId}/plan`), { headers })
    ]);

    if (!bcorpRes.ok) {
      return new Response(`Failed to fetch bcorp data (${bcorpRes.status})`, { status: 502 });
    }
    if (!planRes.ok) {
      return new Response(`Failed to fetch plan (${planRes.status})`, { status: 502 });
    }

    const bcorpJson = await bcorpRes.json();
    const data: BcorpData = bcorpJson.bcorp_data ?? { name: orgName || orgId };

    const planJson = await planRes.json();
    const rawPlan: Plan = (Array.isArray(planJson) ? planJson : (planJson.data ?? [])).filter(
      (a: { tal_action: unknown }) => a.tal_action !== null
    );
    const plan = rawPlan.filter((a) => a.state !== "already_doing");
    const alreadyDoingActions = rawPlan.filter((a) => a.state === "already_doing");

    const buffer = await generateBcorpDocx(data, plan, alreadyDoingActions);
    const filename = `${orgName || orgId} - B Corp Climate Action Report.docx`;

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("DOCX generation error:", message);
    return new Response(message, { status: 500 });
  }
}
