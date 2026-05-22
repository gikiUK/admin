"use client";

import { MultiCheckGroup } from "@/components/analytics/insights/shared/multi-check-group";
import type { OrgFilters } from "@/lib/analytics/insights/cohort-spec";

const TIER_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" }
];

const STATUS_OPTIONS = [
  { value: "never_subscribed", label: "Never subscribed" },
  { value: "incomplete", label: "Incomplete" },
  { value: "active", label: "Active" },
  { value: "payment_failed", label: "Payment failed" },
  { value: "cancelling", label: "Cancelling" },
  { value: "canceled", label: "Canceled" },
  { value: "incomplete_expired", label: "Incomplete expired" }
];

type Props = {
  orgFilters: OrgFilters;
  onChange: (patch: Partial<OrgFilters>) => void;
};

export function CohortTierStatusRow({ orgFilters, onChange }: Props) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <MultiCheckGroup
        legend="Tier"
        options={TIER_OPTIONS}
        value={orgFilters.tier ?? []}
        onChange={(next) => onChange({ tier: next as ("standard" | "premium")[] })}
      />
      <MultiCheckGroup
        legend="Subscription status"
        options={STATUS_OPTIONS}
        value={orgFilters.subscription_status ?? []}
        onChange={(next) => onChange({ subscription_status: next })}
      />
    </div>
  );
}
