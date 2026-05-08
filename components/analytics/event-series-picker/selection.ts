import type { SeriesId } from "@/lib/analytics/event-series";

/** Toggle a single series. Each chip is independent — toggling one never affects others. */
export function toggleSeries(selected: SeriesId[], id: SeriesId): SeriesId[] {
  return selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
}
