"use client";

import { ActionsTable } from "@/components/printables/bcorp-pages/actions-table";
import { CommitmentsAndStandards } from "@/components/printables/bcorp-pages/commitments-and-standards";
import { DisclosureAndSignOff } from "@/components/printables/bcorp-pages/disclosure-and-sign-off";
import { EngagementAndGovernance } from "@/components/printables/bcorp-pages/engagement-and-governance";
import { Foundations } from "@/components/printables/bcorp-pages/foundations";
import { ImplementationPlan } from "@/components/printables/bcorp-pages/implementation-plan";
import { Introduction } from "@/components/printables/bcorp-pages/introduction";
import { Overview } from "@/components/printables/bcorp-pages/overview";
import { ProgressTracking } from "@/components/printables/bcorp-pages/progress-tracking";
import { TableOfContents } from "@/components/printables/bcorp-pages/table-of-contents";
import { BcorpPrintablePage } from "@/components/printables/bcorp-printable-page";

import "./styles.css";

export default function BcorpContentPage() {
  return (
    <BcorpPrintablePage>
      {(props) => (
        <>
          <TableOfContents {...props} />
          <Introduction {...props} />
          <Overview {...props} />
          <Foundations {...props} />
          <ImplementationPlan {...props} />
          <ActionsTable {...props} />
          <EngagementAndGovernance {...props} />
          <CommitmentsAndStandards {...props} />
          <ProgressTracking {...props} />
          <DisclosureAndSignOff {...props} />
        </>
      )}
    </BcorpPrintablePage>
  );
}
