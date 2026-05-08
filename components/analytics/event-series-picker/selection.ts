import type { SeriesId } from "@/lib/analytics/event-series";

export function isAllActive(selected: SeriesId[]): boolean {
  return selected.length === 0 || (selected.length === 1 && selected[0] === "all");
}

export function toggleSeries(selected: SeriesId[], id: SeriesId): SeriesId[] {
  if (id === "all") return [];
  const withoutAll = selected.filter((s) => s !== "all");
  return withoutAll.includes(id) ? withoutAll.filter((s) => s !== id) : [...withoutAll, id];
}
