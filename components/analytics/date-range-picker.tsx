"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type DateRangePreset = "7d" | "30d" | "90d" | "ytd";

const PRESETS: Array<{ value: DateRangePreset; label: string }> = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "ytd", label: "Year to date" }
];

export const DEFAULT_PRESET: DateRangePreset = "30d";

export function isPreset(value: string | null | undefined): value is DateRangePreset {
  return PRESETS.some((preset) => preset.value === value);
}

// Snap `to` to the start of the current hour so the resulting strings stay stable
// across renders within the same hour — otherwise every render produces a new
// millisecond-precise timestamp and breaks query-cache hits.
export function presetToRange(preset: DateRangePreset): { from: string; to: string } {
  const to = new Date();
  to.setMinutes(0, 0, 0);
  const from = new Date(to);
  switch (preset) {
    case "7d":
      from.setDate(to.getDate() - 7);
      break;
    case "30d":
      from.setDate(to.getDate() - 30);
      break;
    case "90d":
      from.setDate(to.getDate() - 90);
      break;
    case "ytd":
      from.setMonth(0);
      from.setDate(1);
      break;
  }
  return { from: from.toISOString(), to: to.toISOString() };
}

/** Equal-length window ending where the current one starts. */
export function previousRange(from: string, to: string): { from: string; to: string } {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const span = toDate.getTime() - fromDate.getTime();
  return {
    from: new Date(fromDate.getTime() - span).toISOString(),
    to: fromDate.toISOString()
  };
}

type DateRangePickerProps = {
  value: DateRangePreset;
  onChange: (next: DateRangePreset) => void;
};

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as DateRangePreset)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PRESETS.map((preset) => (
          <SelectItem key={preset.value} value={preset.value}>
            {preset.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
