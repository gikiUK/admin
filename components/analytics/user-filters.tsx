"use client";

import { X } from "lucide-react";
import { StatusSelectItem } from "@/components/analytics/status-select-item";
import { Button } from "@/components/ui/button";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { USER_STATUSES, type UserStatus, type UsersFilter, type UsersOrder } from "@/lib/analytics/api";

const ORDER_OPTIONS: Array<{ value: UsersOrder; label: string }> = [
  { value: "most_active", label: "Most recently active" },
  { value: "least_active", label: "Least active" },
  { value: "newest_signup", label: "Newest signup" },
  { value: "oldest_signup", label: "Oldest signup" }
];

const STATUS_DESCRIPTIONS: Record<UserStatus, string> = {
  active: "Performed an action in the last 6 months.",
  dormant: "Last action was 6 to 12 months ago.",
  churned: "No action in the last 12 months, or no actions ever recorded.",
  unconfirmed: "Has not confirmed their email address yet.",
  bounced: "Their email address hard-bounced and can no longer be reached."
};

const ALL_STATUSES = "__all__";

type UserFiltersProps = {
  filter: UsersFilter;
  onChange: (patch: Partial<UsersFilter>) => void;
  onReset: () => void;
};

export function UserFilters({ filter, onChange, onReset }: UserFiltersProps) {
  const isFiltered = Boolean(filter.query || filter.company_id || filter.status || filter.order);
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <FilterField label="Search">
        <DebouncedInput
          placeholder="Email or name"
          value={filter.query ?? ""}
          onCommit={(value) => onChange({ query: value || undefined })}
        />
      </FilterField>
      <FilterField label="Company ID">
        <DebouncedInput
          placeholder="123"
          value={filter.company_id ?? ""}
          onCommit={(value) => onChange({ company_id: value || undefined })}
        />
      </FilterField>
      <FilterField label="Status">
        <Select
          value={filter.status ?? ALL_STATUSES}
          onValueChange={(value) => onChange({ status: value === ALL_STATUSES ? undefined : (value as UserStatus) })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <TooltipProvider delayDuration={200} disableHoverableContent>
              <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
              {USER_STATUSES.map((status) => (
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
            onValueChange={(value) => onChange({ order: value as UsersOrder })}
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
