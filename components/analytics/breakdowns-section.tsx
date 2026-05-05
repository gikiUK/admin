"use client";

import { AssignmentBreakdown } from "@/components/analytics/assignment-breakdown";
import { CustomActions } from "@/components/analytics/custom-actions";
import { OnboardingFunnel } from "@/components/analytics/onboarding-funnel";
import { PreGikiBreakdown } from "@/components/analytics/pre-giki-breakdown";
import type { AnalyticsSummary } from "@/lib/analytics/api";

type BreakdownsSectionProps = {
  data: AnalyticsSummary;
};

export function BreakdownsSection({ data }: BreakdownsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OnboardingFunnel funnel={data.onboarding_funnel} />
        <PreGikiBreakdown breakdown={data.pre_giki_breakdown} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AssignmentBreakdown breakdown={data.assignment_breakdown} />
        <CustomActions custom={data.custom_actions} />
      </div>
    </div>
  );
}
