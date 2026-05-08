"use client";

import { Inbox, MousePointerClick, Undo2 } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Area, AreaChart, Brush, CartesianGrid, Line, LineChart, ReferenceArea, XAxis, YAxis } from "recharts";
import { EventSeriesPicker } from "@/components/analytics/event-series-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
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

export type ChartClickPayload = { date: string; seriesKey: string | null };

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
  onPointClick?: (payload: ChartClickPayload) => void;
};

type ChartState = {
  activeLabel?: string | number;
  activeTooltipIndex?: number | string | null;
  activePayload?: Array<{ dataKey?: string | number }>;
};

function toIndex(value: number | string | null | undefined): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function isInsideBrush(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(".recharts-brush") !== null;
}

type ZoomRange = { startIndex: number; endIndex: number } | null;

function formatTick(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function trimLeadingZeros(points: ChartPoint[], keys: string[]): ChartPoint[] {
  const firstNonZero = points.findIndex((point) => keys.some((key) => Number(point[key] ?? 0) > 0));
  return firstNonZero === -1 ? points : points.slice(firstNonZero);
}

const DRAG_THRESHOLD = 6;

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
  onCompareChange,
  onPointClick
}: EventsTimeSeriesProps) {
  const seriesDefs: SeriesDef[] = useMemo(() => {
    const resolved: SeriesDef[] = [];
    for (const id of selected) {
      const def = getSeries(id);
      if (def) resolved.push(def);
    }
    return resolved;
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

  const hasNoSelection = seriesDefs.length === 0;
  const hasNoData = !hasNoSelection && (trimmed.length === 0 || grandTotal === 0);
  const hasData = !hasNoSelection && !hasNoData;
  const showBrush = trimmed.length >= 14;

  const [zoom, setZoom] = useState<ZoomRange>(null);
  const [dragRange, setDragRange] = useState<{ from: string; to: string } | null>(null);
  const dragStartRef = useRef<{ x: number; index: number; label: string } | null>(null);

  const resetZoom = useCallback(() => {
    setZoom(null);
    setDragRange(null);
    dragStartRef.current = null;
  }, []);

  const handleBrushChange = useCallback(
    (range: { startIndex?: number; endIndex?: number } | null) => {
      if (!range || range.startIndex === undefined || range.endIndex === undefined) return;
      if (range.startIndex === 0 && range.endIndex === trimmed.length - 1) {
        setZoom(null);
        return;
      }
      setZoom({ startIndex: range.startIndex, endIndex: range.endIndex });
    },
    [trimmed.length]
  );

  const handleMouseDown = useCallback((state: ChartState | null, event: React.MouseEvent) => {
    if (isInsideBrush(event.target)) return;
    if (!state || state.activeLabel === undefined) return;
    const index = toIndex(state.activeTooltipIndex);
    if (index === null) return;
    dragStartRef.current = {
      x: event.clientX,
      index,
      label: String(state.activeLabel)
    };
    setDragRange(null);
  }, []);

  const handleMouseMove = useCallback((state: ChartState | null, event: React.MouseEvent) => {
    const start = dragStartRef.current;
    if (!start || !state?.activeLabel) return;
    const dx = Math.abs(event.clientX - start.x);
    if (dx < DRAG_THRESHOLD) return;
    const nextLabel = String(state.activeLabel);
    const [from, to] = nextLabel < start.label ? [nextLabel, start.label] : [start.label, nextLabel];
    setDragRange({ from, to });
  }, []);

  const handleMouseUp = useCallback(
    (state: ChartState | null, event: React.MouseEvent) => {
      const start = dragStartRef.current;
      dragStartRef.current = null;
      if (isInsideBrush(event.target)) {
        setDragRange(null);
        return;
      }
      const dx = start ? Math.abs(event.clientX - start.x) : 0;

      const endIdx = toIndex(state?.activeTooltipIndex);
      if (start && dx >= DRAG_THRESHOLD && endIdx !== null) {
        const a = start.index;
        const b = endIdx;
        const startIndex = Math.min(a, b);
        const endIndex = Math.max(a, b);
        if (startIndex !== endIndex) {
          setZoom({ startIndex, endIndex });
        }
        setDragRange(null);
        return;
      }

      setDragRange(null);
      // Treated as a click — fire onPointClick with the active label.
      if (onPointClick && state?.activeLabel) {
        const date = String(state.activeLabel);
        const top = state.activePayload?.[0];
        const rawKey = typeof top?.dataKey === "string" ? top.dataKey : null;
        const seriesKey = rawKey && !rawKey.startsWith("prev_") ? rawKey : null;
        onPointClick({ date, seriesKey });
      }
    },
    [onPointClick]
  );

  const handleMouseLeave = useCallback(() => {
    dragStartRef.current = null;
    setDragRange(null);
  }, []);

  const cursorClass = onPointClick || trimmed.length > 1 ? "cursor-crosshair" : undefined;

  const chartHeightClass = showBrush ? "h-[340px]" : "h-[280px]";

  const refArea = dragRange ? (
    <ReferenceArea x1={dragRange.from} x2={dragRange.to} strokeOpacity={0} fill="var(--primary)" fillOpacity={0.08} />
  ) : null;

  const brushProps = showBrush
    ? {
        dataKey: "date" as const,
        height: 32,
        travellerWidth: 10,
        stroke: "var(--primary)",
        fill: "var(--muted)",
        fillOpacity: 0.5,
        tickFormatter: formatTick,
        startIndex: zoom?.startIndex ?? 0,
        endIndex: zoom?.endIndex ?? Math.max(trimmed.length - 1, 0),
        onChange: handleBrushChange,
        y: undefined as number | undefined
      }
    : null;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <CardTitle className="text-base">Activity</CardTitle>
          <div className="flex items-baseline gap-2 text-sm">
            {!hasNoSelection && (
              <span className="text-muted-foreground tabular-nums">{grandTotal.toLocaleString()} total</span>
            )}
            {!hasNoSelection && delta !== null && (
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
        {hasNoSelection && (
          <ChartPlaceholder
            icon={MousePointerClick}
            title="No series selected"
            description="Pick an event group above to start charting."
            heightClass={chartHeightClass}
          />
        )}
        {hasNoData && (
          <ChartPlaceholder
            icon={Inbox}
            title="No events in this selection"
            description="Try a different date range, or pick another event group."
            heightClass={chartHeightClass}
          />
        )}
        {hasData && (
          <div className="space-y-2">
            <div className="flex h-6 items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {zoom ? "Drag the slider below to adjust" : "Drag on the chart to zoom"}
              </span>
              {zoom && (
                <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs" onClick={resetZoom}>
                  <Undo2 className="size-3" />
                  Reset zoom
                </Button>
              )}
            </div>
            <ChartContainer
              config={chartConfig}
              className={`${chartHeightClass} w-full select-none ${cursorClass ?? ""}`.trim()}
            >
              {showStacked ? (
                <AreaChart
                  data={trimmed}
                  margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={formatTick}
                    height={showBrush ? 48 : 30}
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
                  {refArea}
                  {brushProps && <Brush {...brushProps} />}
                </AreaChart>
              ) : (
                <LineChart
                  data={trimmed}
                  margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={formatTick}
                    height={showBrush ? 48 : 30}
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
                  {refArea}
                  {brushProps && <Brush {...brushProps} />}
                </LineChart>
              )}
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type ChartPlaceholderProps = {
  icon: typeof Inbox;
  title: string;
  description: string;
  heightClass: string;
};

function ChartPlaceholder({ icon: Icon, title, description, heightClass }: ChartPlaceholderProps) {
  return (
    <div className={`flex ${heightClass} flex-col items-center justify-center gap-2 text-center`}>
      <Icon className="size-8 text-muted-foreground/60" aria-hidden />
      <div className="text-sm font-medium text-foreground">{title}</div>
      <div className="max-w-xs text-xs text-muted-foreground">{description}</div>
    </div>
  );
}
