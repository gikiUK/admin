"use client";

import { CalendarRange, X } from "lucide-react";
import { useState } from "react";
import { EntityPicker, type EntityResult } from "@/components/analytics/entity-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACTION_TYPES, type EventsFilter, fetchOrganizations, fetchUsers } from "@/lib/analytics/api";
import { getEventDisplay } from "@/lib/analytics/event-display";

async function searchCompanies(query: string): Promise<EntityResult[]> {
  const response = await fetchOrganizations({ query, per: 10 });
  return response.results.map((org) => ({ id: org.id, label: org.name, hint: org.slug }));
}

async function searchUsers(query: string): Promise<EntityResult[]> {
  const response = await fetchUsers({ query, per: 10 });
  return response.results.map((user) => ({
    id: user.id,
    label: user.name || user.email,
    hint: user.name ? user.email : undefined
  }));
}

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
  return "Filter by date";
}

export function EventFilters({ filter, onChange, onReset }: EventFiltersProps) {
  const isFiltered = Boolean(
    filter.action_type || filter.company_id || filter.user_id || filter.from || filter.to || filter.order
  );
  const hasDateFilter = Boolean(filter.from || filter.to);

  return (
    <div className="space-y-3">
      <DateRangeFilter filter={filter} onChange={onChange} active={hasDateFilter} />
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
        <FilterField label="Company">
          <EntityPicker
            placeholder="Search companies…"
            selectedLabel={filter.company_label}
            search={searchCompanies}
            onPick={(entity) => onChange({ company_id: String(entity.id), company_label: entity.label })}
            onClear={() => onChange({ company_id: undefined, company_label: undefined })}
          />
        </FilterField>
        <FilterField label="User">
          <EntityPicker
            placeholder="Search users…"
            selectedLabel={filter.user_label}
            search={searchUsers}
            onPick={(entity) => onChange({ user_id: String(entity.id), user_label: entity.label })}
            onClear={() => onChange({ user_id: undefined, user_label: undefined })}
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

type DateRangeFilterProps = {
  filter: EventsFilter;
  onChange: (patch: Partial<EventsFilter>) => void;
  active: boolean;
};

function DateRangeFilter({ filter, onChange, active }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);

  function clear() {
    onChange({ from: undefined, to: undefined });
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-3 py-1.5 text-xs hover:bg-muted"
          >
            <CalendarRange className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Date:</span>
            <span className={active ? "font-medium" : "text-muted-foreground"}>
              {dateRangeLabel(filter.from, filter.to)}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 space-y-3 p-3 text-xs">
          <DateInput label="From" value={filter.from} onCommit={(iso) => onChange({ from: iso })} endOfDay={false} />
          <DateInput label="To" value={filter.to} onCommit={(iso) => onChange({ to: iso })} endOfDay />
        </PopoverContent>
      </Popover>
      {active && (
        <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={clear}>
          <X className="size-3" />
          Clear date
        </Button>
      )}
    </div>
  );
}

type DateInputProps = {
  label: string;
  value: string | undefined;
  onCommit: (iso: string | undefined) => void;
  /** When true (used for `to`), commits the END of the selected day. */
  endOfDay: boolean;
};

function DateInput({ label, value, onCommit, endOfDay }: DateInputProps) {
  const dateValue = value ? toDateInput(value) : "";

  function handleChange(next: string) {
    if (!next) {
      onCommit(undefined);
      return;
    }
    const iso = endOfDay ? `${next}T23:59:59.999Z` : `${next}T00:00:00.000Z`;
    onCommit(iso);
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input type="date" value={dateValue} onChange={(event) => handleChange(event.target.value)} className="text-xs" />
    </div>
  );
}

function toDateInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
