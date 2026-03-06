"use client";

import { CertificationsSection } from "@/components/bcorps/sections/certifications-section";
import { DisclosureSection } from "@/components/bcorps/sections/disclosure-section";
import { EmissionTargetsSection } from "@/components/bcorps/sections/emission-targets-section";
import { EngagementSection } from "@/components/bcorps/sections/engagement-section";
import { FoundationsSection } from "@/components/bcorps/sections/foundations-section";
import { GovernanceSection } from "@/components/bcorps/sections/governance-section";
import { ImplementationPlanSection } from "@/components/bcorps/sections/implementation-plan-section";
import { IntroductionSection } from "@/components/bcorps/sections/introduction-section";
import { PoliciesSection } from "@/components/bcorps/sections/policies-section";
import { ProgressTrackingSection } from "@/components/bcorps/sections/progress-tracking-section";
import { SignOffSection } from "@/components/bcorps/sections/sign-off-section";
import { useBcorpForm } from "@/components/bcorps/use-bcorp-form";
import { useBcorpHeader } from "@/lib/bcorp/bcorp-header-context";
import type { BcorpData } from "@/lib/bcorp/types";

export type SaveState = "idle" | "saving" | "saved" | "error";

type BcorpDataFormProps = {
  orgId: string;
  initialData: BcorpData;
};

export function BcorpDataForm({ orgId, initialData }: BcorpDataFormProps) {
  const { get, set, hint } = useBcorpForm(orgId, initialData);
  const { plan } = useBcorpHeader();

  const engagementActions = plan.filter((a) => a.tal_action.ghg_scope?.includes("Engagement"));
  const governanceActions = plan.filter((a) => a.tal_action.ghg_scope?.includes("Governance"));
  const disclosureActions = plan.filter((a) =>
    (a.tal_action.themes ?? []).includes("Governance disclosure and reporting")
  );

  return (
    <div>
      <IntroductionSection get={get} set={set} hint={hint} />
      <FoundationsSection get={get} set={set} hint={hint} />
      <ImplementationPlanSection get={get} set={set} hint={hint} />
      <EngagementSection get={get} set={set} actions={engagementActions} />
      <GovernanceSection get={get} set={set} actions={governanceActions} />
      <DisclosureSection get={get} set={set} hint={hint} actions={disclosureActions} />
      <ProgressTrackingSection get={get} set={set} hint={hint} />
      <EmissionTargetsSection get={get} set={set} hint={hint} />
      <CertificationsSection get={get} set={set} />
      <PoliciesSection get={get} set={set} />
      <SignOffSection get={get} set={set} hint={hint} />
    </div>
  );
}
