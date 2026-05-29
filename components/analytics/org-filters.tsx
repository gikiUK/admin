"use client";

import { X } from "lucide-react";
import { StatusSelectItem } from "@/components/analytics/status-select-item";
import { Button } from "@/components/ui/button";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ORG_STATUSES,
  ORG_TIERS,
  type OrgStatus,
  type OrgsFilter,
  type OrgsOrder,
  type OrgTier
} from "@/lib/analytics/api";

const ORDER_OPTIONS: Array<{ value: OrgsOrder; label: string }> = [
  { value: "most_active", label: "Most recently active" },
  { value: "oldest_active", label: "Least recently active" },
  { value: "most_events", label: "Most events" },
  { value: "least_active", label: "Fewest events" },
  { value: "newest_signup", label: "Newest signup" },
  { value: "oldest_signup", label: "Oldest signup" },
  { value: "most_members", label: "Most members" },
  { value: "fewest_members", label: "Fewest members" }
];

const STATUS_DESCRIPTIONS: Record<OrgStatus, string> = {
  trial: "Currently in an active trial (trial end date is in the future).",
  onboarding: "Signed up less than 7 days ago and has no recorded events yet.",
  active: "Has a recorded event in the last 6 months.",
  dormant: "Last event was 6 to 12 months ago.",
  churned: "No event in the last 12 months, or no events ever and signed up over 7 days ago."
};

const ALL_STATUSES = "__all__";
const ALL_TIERS = "__all__";

type OrgFiltersProps = {
  filter: OrgsFilter;
  onChange: (patch: Partial<OrgsFilter>) => void;
  onReset: () => void;
};

export function OrgFilters({ filter, onChange, onReset }: OrgFiltersProps) {
  const isFiltered = Boolean(filter.query || filter.tier || filter.status || filter.order);
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <FilterField label="Search">
        <DebouncedInput
          placeholder="Name or slug"
          value={filter.query ?? ""}
          onCommit={(value) => onChange({ query: value || undefined })}
        />
      </FilterField>
      <FilterField label="Tier">
        <Select
          value={filter.tier ?? ALL_TIERS}
          onValueChange={(value) => onChange({ tier: value === ALL_TIERS ? undefined : (value as OrgTier) })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All tiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TIERS}>All tiers</SelectItem>
            {ORG_TIERS.map((tier) => (
              <SelectItem key={tier} value={tier}>
                {tier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>
      <FilterField label="Status">
        <Select
          value={filter.status ?? ALL_STATUSES}
          onValueChange={(value) => onChange({ status: value === ALL_STATUSES ? undefined : (value as OrgStatus) })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <TooltipProvider delayDuration={200} disableHoverableContent>
              <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
              {ORG_STATUSES.map((status) => (
                <StatusSelectItem
                  key={status}
                  value={status}
                  label={status}
                  description={STATUS_DESCRIPTIONS[status]}
                />
              ))}
            </TooltipProvider>
          </SelectContent>
        </Select>
      </FilterField>
      <FilterField label="Order">
        <div className="flex gap-2">
          <Select
            value={filter.order ?? "most_active"}
            onValueChange={(value) => onChange({ order: value as OrgsOrder })}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isFiltered && (
            <Button variant="ghost" size="icon" onClick={onReset} aria-label="Clear filters">
              <X />
            </Button>
          )}
        </div>
      </FilterField>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
