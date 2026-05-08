"use client";

import { CalendarRange, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACTION_TYPES, type EventsFilter } from "@/lib/analytics/api";
import { getEventDisplay } from "@/lib/analytics/event-display";

const ORDER_OPTIONS: Array<{ value: NonNullable<EventsFilter["order"]>; label: string }> = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" }
];

const ALL_EVENTS = "__all__";

type EventFiltersProps = {
  filter: EventsFilter;
  onChange: (patch: Partial<EventsFilter>) => void;
  onReset: () => void;
};

function formatDateLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function dateRangeLabel(from?: string, to?: string): string {
  if (from && to) {
    const fromLabel = formatDateLabel(from);
    const toLabel = formatDateLabel(to);
    return fromLabel === toLabel ? `On ${fromLabel}` : `${fromLabel} – ${toLabel}`;
  }
  if (from) return `From ${formatDateLabel(from)}`;
  if (to) return `Until ${formatDateLabel(to)}`;
  return "";
}

export function EventFilters({ filter, onChange, onReset }: EventFiltersProps) {
  const isFiltered = Boolean(
    filter.action_type || filter.company_id || filter.user_id || filter.from || filter.to || filter.order
  );
  const hasDateFilter = Boolean(filter.from || filter.to);
  return (
    <div className="space-y-3">
      {hasDateFilter && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs">
          <CalendarRange className="size-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Date:</span>
          <span className="font-medium">{dateRangeLabel(filter.from, filter.to)}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-6 gap-1 px-2 text-xs"
            onClick={() => onChange({ from: undefined, to: undefined })}
          >
            <X className="size-3" />
            Clear date
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FilterField label="Event">
          <Select
            value={filter.action_type ?? ALL_EVENTS}
            onValueChange={(value) => onChange({ action_type: value === ALL_EVENTS ? undefined : value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_EVENTS}>All events</SelectItem>
              {ACTION_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {getEventDisplay(type).label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Company ID">
          <DebouncedInput
            placeholder="123"
            value={filter.company_id ?? ""}
            onCommit={(value) => onChange({ company_id: value || undefined })}
          />
        </FilterField>
        <FilterField label="User ID">
          <DebouncedInput
            placeholder="456"
            value={filter.user_id ?? ""}
            onCommit={(value) => onChange({ user_id: value || undefined })}
          />
        </FilterField>
        <FilterField label="Order">
          <div className="flex gap-2">
            <Select
              value={filter.order ?? "newest"}
              onValueChange={(value) => onChange({ order: value as EventsFilter["order"] })}
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
