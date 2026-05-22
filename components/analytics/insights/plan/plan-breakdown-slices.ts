import type { PlanBreakdown, PlanBreakdownValue } from "@/lib/analytics/insights/insights-api";

export type PlanSlice = {
  key: string;
  label: string;
  count: number;
  share: number;
  fill: string;
};

const UNSET_COLOR = "hsl(220, 8%, 60%)";

// Distinct hues spread across the wheel; lifted into the muted range so charts stay calm.
function sliceColor(index: number, total: number): string {
  const hue = Math.round((index * 360) / Math.max(total, 1));
  return `hsl(${hue}, 55%, 55%)`;
}

function humanize(raw: PlanBreakdownValue["value"]): string {
  if (raw === null) return "(unset)";
  if (typeof raw === "boolean") return raw ? "Yes" : "No";
  return String(raw)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildPlanSlices(breakdown: PlanBreakdown): PlanSlice[] {
  const sorted = [...breakdown.values].sort((a, b) => b.count - a.count);
  const realSliceCount = sorted.filter((v) => v.value !== null).length;
  let colorIndex = 0;

  return sorted.map((v) => {
    const isUnset = v.value === null;
    const fill = isUnset ? UNSET_COLOR : sliceColor(colorIndex++, realSliceCount);
    return {
      key: String(v.value),
      label: humanize(v.value),
      count: v.count,
      share: v.share,
      fill
    };
  });
}
