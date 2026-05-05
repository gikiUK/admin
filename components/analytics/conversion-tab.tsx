"use client";

import { RevenueInRange } from "@/components/analytics/revenue-in-range";
import { SubscriptionStatusBreakdown } from "@/components/analytics/subscription-status-breakdown";
import { TierBreakdown } from "@/components/analytics/tier-breakdown";
import type { AnalyticsSummary } from "@/lib/analytics/api";

type ConversionTabProps = {
  data: AnalyticsSummary;
};

export function ConversionTab({ data }: ConversionTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TierBreakdown tiers={data.tier_breakdown} />
        <RevenueInRange revenue={data.revenue_in_range} />
        <SubscriptionStatusBreakdown statuses={data.subscription_status_breakdown} />
      </div>
    </div>
  );
}
