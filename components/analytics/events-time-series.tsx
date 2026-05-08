"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { EventSeriesPicker } from "@/components/analytics/event-series-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  ALL_SERIES_DEF,
  aggregate,
  type ChartPoint,
  getSeries,
  mergePreviousSeries,
  previousKeyFor,
  type SeriesDef,
  type SeriesId,
  smoothSeries,
  totalsFor
} from "@/lib/analytics/event-series";

export type ChartMode = "line" | "stacked";

type RawPoint = { date: string; by_type: Record<string, number> };

type EventsTimeSeriesProps = {
  data: RawPoint[];
  previousData: RawPoint[] | null;
  selected: SeriesId[];
  mode: ChartMode;
  smooth: boolean;
  compare: boolean;
  onSelectedChange: (next: SeriesId[]) => void;
  onModeChange: (next: ChartMode) => void;
  onSmoothChange: (next: boolean) => void;
  onCompareChange: (next: boolean) => void;
};

function formatTick(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function trimLeadingZeros(points: ChartPoint[], keys: string[]): ChartPoint[] {
  const firstNonZero = points.findIndex((point) => keys.some((key) => Number(point[key] ?? 0) > 0));
  return firstNonZero === -1 ? points : points.slice(firstNonZero);
}

export function EventsTimeSeries({
  data,
  previousData,
  selected,
  mode,
  smooth,
  compare,
  onSelectedChange,
  onModeChange,
  onSmoothChange,
  onCompareChange
}: EventsTimeSeriesProps) {
  const seriesDefs: SeriesDef[] = useMemo(() => {
    if (selected.length === 0) return [ALL_SERIES_DEF];
    const resolved: SeriesDef[] = [];
    for (const id of selected) {
      const def = getSeries(id);
      if (def) resolved.push(def);
    }
    return resolved.length > 0 ? resolved : [ALL_SERIES_DEF];
  }, [selected]);

  const showStacked = mode === "stacked" && seriesDefs.length > 1;
  const compareActive = compare && !showStacked && previousData !== null;

  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    for (const series of seriesDefs) {
      config[series.key] = { label: series.label, color: series.color };
      if (compareActive) {
        config[previousKeyFor(series.key)] = {
          label: `${series.label} (prev)`,
          color: series.color
        };
      }
    }
    return config;
  }, [seriesDefs, compareActive]);

  const points: ChartPoint[] = useMemo(() => {
    const seriesKeys = seriesDefs.map((s) => s.key);
    let current = aggregate(data, seriesDefs);
    let previous = compareActive && previousData ? aggregate(previousData, seriesDefs) : null;

    if (smooth) {
      current = smoothSeries(current, seriesKeys);
      if (previous) previous = smoothSeries(previous, seriesKeys);
    }

    if (previous) {
      return mergePreviousSeries(current, previous, seriesKeys);
    }
    return current;
  }, [data, previousData, seriesDefs, compareActive, smooth]);

  const seriesKeys = useMemo(() => seriesDefs.map((s) => s.key), [seriesDefs]);
  const trimmed = useMemo(() => trimLeadingZeros(points, seriesKeys), [points, seriesKeys]);

  const totals = useMemo(() => totalsFor(data, seriesDefs), [data, seriesDefs]);
  const grandTotal = useMemo(() => Object.values(totals).reduce((sum, n) => sum + n, 0), [totals]);
  const previousTotal = useMemo(() => {
    if (!compareActive || !previousData) return null;
    return Object.values(totalsFor(previousData, seriesDefs)).reduce((sum, n) => sum + n, 0);
  }, [previousData, compareActive, seriesDefs]);

  const delta = useMemo(() => {
    if (previousTotal === null) return null;
    if (previousTotal === 0) return grandTotal > 0 ? Number.POSITIVE_INFINITY : 0;
    return (grandTotal - previousTotal) / previousTotal;
  }, [grandTotal, previousTotal]);

  const isEmpty = trimmed.length === 0 || grandTotal === 0;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <CardTitle className="text-base">Activity</CardTitle>
          <div className="flex items-baseline gap-2 text-sm">
            <span className="text-muted-foreground tabular-nums">{grandTotal.toLocaleString()} total</span>
            {delta !== null && (
              <span
                className={
                  delta === 0
                    ? "text-muted-foreground tabular-nums"
                    : delta > 0
                      ? "text-emerald-600 dark:text-emerald-400 tabular-nums"
                      : "text-rose-600 dark:text-rose-400 tabular-nums"
                }
              >
                {Number.isFinite(delta) ? `${delta >= 0 ? "+" : ""}${(delta * 100).toFixed(0)}% vs prev` : "↑ from 0"}
              </span>
            )}
          </div>
        </div>
        <EventSeriesPicker
          selected={selected}
          onSelectedChange={onSelectedChange}
          mode={mode}
          onModeChange={onModeChange}
          smooth={smooth}
          onSmoothChange={onSmoothChange}
          compare={compare}
          onCompareChange={onCompareChange}
          compareDisabled={showStacked}
        />
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="text-sm text-muted-foreground">No events in range.</div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            {showStacked ? (
              <AreaChart data={trimmed} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={formatTick}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} allowDecimals={false} />
                <ChartTooltip
                  cursor={{ stroke: "var(--border)" }}
                  content={
                    <ChartTooltipContent labelFormatter={(value) => formatTick(String(value))} indicator="dot" />
                  }
                />
                <defs>
                  {seriesDefs.map((series) => (
                    <linearGradient key={series.key} id={`fill-${series.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={`var(--color-${series.key})`} stopOpacity={0.55} />
                      <stop offset="95%" stopColor={`var(--color-${series.key})`} stopOpacity={0.1} />
                    </linearGradient>
                  ))}
                </defs>
                {seriesDefs.map((series) => (
                  <Area
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    stroke={`var(--color-${series.key})`}
                    fill={`url(#fill-${series.key})`}
                    strokeWidth={2}
                    stackId="stack"
                    isAnimationActive={false}
                  />
                ))}
              </AreaChart>
            ) : (
              <LineChart data={trimmed} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={formatTick}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} allowDecimals={false} />
                <ChartTooltip
                  cursor={{ stroke: "var(--border)" }}
                  content={
                    <ChartTooltipContent labelFormatter={(value) => formatTick(String(value))} indicator="line" />
                  }
                />
                {compareActive &&
                  seriesDefs.map((series) => (
                    <Line
                      key={`prev-${series.key}`}
                      type="monotone"
                      dataKey={previousKeyFor(series.key)}
                      stroke={`var(--color-${series.key})`}
                      strokeOpacity={0.4}
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                {seriesDefs.map((series) => (
                  <Line
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    stroke={`var(--color-${series.key})`}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            )}
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
