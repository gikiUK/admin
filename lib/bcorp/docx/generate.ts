import { Document, Packer, SectionType } from "docx";
import type { BcorpData, Plan } from "@/lib/bcorp/types";
import { buildActionsTable } from "./sections/actions-table";
import { buildCommitmentsAndStandards } from "./sections/commitments-and-standards";
import { buildDisclosureAndSignOff } from "./sections/disclosure-and-sign-off";
import { buildEngagementAndGovernance } from "./sections/engagement-and-governance";
import { buildFoundations } from "./sections/foundations";
import { buildImplementationPlan } from "./sections/implementation-plan";
import { buildIntroduction } from "./sections/introduction";
import { buildProgressTracking } from "./sections/progress-tracking";
import { buildTableOfContents } from "./sections/table-of-contents";
import { buildTitlePage } from "./sections/title-page";
import { documentStyles } from "./styles";

export async function generateBcorpDocx(data: BcorpData, plan: Plan, alreadyDoingActions: Plan): Promise<Uint8Array> {
  const doc = new Document({
    styles: documentStyles(),
    sections: [
      // Title page — dark background, no page numbers
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 },
            size: { width: 11906, height: 16838 } // A4
          }
        },
        children: buildTitlePage(data)
      },
      // Body content
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            margin: { top: 600, bottom: 600, left: 720, right: 800 },
            size: { width: 11906, height: 16838 }
          }
        },
        children: [
          ...buildTableOfContents(data, plan),
          ...buildIntroduction(data),
          ...buildFoundations(data),
          ...buildImplementationPlan(data),
          ...buildActionsTable(plan),
          ...buildEngagementAndGovernance(data, plan),
          ...buildCommitmentsAndStandards(data),
          ...buildProgressTracking(data, plan, alreadyDoingActions),
          ...buildDisclosureAndSignOff(data, plan)
        ]
      }
    ]
  });

  return new Uint8Array(await Packer.toBuffer(doc));
}
