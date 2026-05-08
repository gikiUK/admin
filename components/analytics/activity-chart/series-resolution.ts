import type { ChartConfig } from "@/components/ui/chart";
import {
  aggregate,
  type ChartPoint,
  getSeries,
  mergePreviousSeries,
  previousKeyFor,
  type SeriesDef,
  type SeriesId,
  smoothSeries
} from "@/lib/analytics/event-series";
import type { RawPoint } from "./types";

export function resolveSeries(selected: SeriesId[]): SeriesDef[] {
  const out: SeriesDef[] = [];
  for (const id of selected) {
    const def = getSeries(id);
    if (def) out.push(def);
  }
  return out;
}

export function buildChartConfig(seriesDefs: SeriesDef[], compareActive: boolean): ChartConfig {
  const config: ChartConfig = {};
  for (const series of seriesDefs) {
    config[series.key] = { label: series.label, color: series.color };
    if (compareActive) {
      config[previousKeyFor(series.key)] = { label: `${series.label} (prev)`, color: series.color };
    }
  }
  return config;
}

type BuildPointsArgs = {
  data: RawPoint[];
  previousData: RawPoint[] | null;
  seriesDefs: SeriesDef[];
  compareActive: boolean;
  smooth: boolean;
};

export function buildPoints({ data, previousData, seriesDefs, compareActive, smooth }: BuildPointsArgs): ChartPoint[] {
  const seriesKeys = seriesDefs.map((s) => s.key);
  let current = aggregate(data, seriesDefs);
  let previous = compareActive && previousData ? aggregate(previousData, seriesDefs) : null;

  if (smooth) {
    current = smoothSeries(current, seriesKeys);
    if (previous) previous = smoothSeries(previous, seriesKeys);
  }

  return previous ? mergePreviousSeries(current, previous, seriesKeys) : current;
}
