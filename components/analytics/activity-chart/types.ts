import type { SeriesId } from "@/lib/analytics/event-series";

export type ChartMode = "line" | "stacked";

/** Shape returned by analytics endpoints that ship per-day per-action_type counts. */
export type RawPoint = { date: string; by_type: Record<string, number> };

export type ChartClickPayload = { date: string; seriesKey: string | null };

export type ActivityChartProps = {
  /** Card title. Defaults to "Activity". */
  title?: string;
  data: RawPoint[];
  previousData?: RawPoint[] | null;
  selected: SeriesId[];
  mode: ChartMode;
  smooth: boolean;
  compare: boolean;
  onSelectedChange: (next: SeriesId[]) => void;
  onModeChange: (next: ChartMode) => void;
  onSmoothChange: (next: boolean) => void;
  onCompareChange: (next: boolean) => void;
  onPointClick?: (payload: ChartClickPayload) => void;
};
