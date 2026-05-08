"use client";

import { Area, AreaChart, Brush, CartesianGrid, Line, LineChart, ReferenceArea, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { type ChartPoint, previousKeyFor, type SeriesDef } from "@/lib/analytics/event-series";
import { formatTick } from "./format";
import type { useChartZoom } from "./use-chart-zoom";

type ZoomHandlers = ReturnType<typeof useChartZoom>;

type Props = {
  data: ChartPoint[];
  seriesDefs: SeriesDef[];
  chartConfig: ChartConfig;
  showStacked: boolean;
  showBrush: boolean;
  showCompare: boolean;
  cursorClass?: string;
  heightClass: string;
  zoom: ZoomHandlers;
};

export function ChartCanvas({
  data,
  seriesDefs,
  chartConfig,
  showStacked,
  showBrush,
  showCompare,
  cursorClass,
  heightClass,
  zoom
}: Props) {
  const refArea = zoom.dragRange ? (
    <ReferenceArea
      x1={zoom.dragRange.from}
      x2={zoom.dragRange.to}
      strokeOpacity={0}
      fill="var(--primary)"
      fillOpacity={0.08}
    />
  ) : null;

  const brush = showBrush ? (
    <Brush
      dataKey="date"
      height={32}
      travellerWidth={10}
      stroke="var(--primary)"
      fill="var(--muted)"
      fillOpacity={0.5}
      tickFormatter={formatTick}
      startIndex={zoom.zoom?.startIndex ?? 0}
      endIndex={zoom.zoom?.endIndex ?? Math.max(data.length - 1, 0)}
      onChange={zoom.handleBrushChange}
    />
  ) : null;

  const xAxis = (
    <XAxis
      dataKey="date"
      tickLine={false}
      axisLine={false}
      tickMargin={8}
      minTickGap={32}
      tickFormatter={formatTick}
      height={showBrush ? 48 : 30}
    />
  );
  const yAxis = <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} allowDecimals={false} />;
  const grid = <CartesianGrid vertical={false} strokeDasharray="3 3" />;
  const margin = { top: 8, right: 8, left: 8, bottom: 0 };
  const mouseHandlers = {
    onMouseDown: zoom.onMouseDown,
    onMouseMove: zoom.onMouseMove,
    onMouseUp: zoom.onMouseUp,
    onMouseLeave: zoom.onMouseLeave
  };

  return (
    <ChartContainer config={chartConfig} className={`${heightClass} w-full select-none ${cursorClass ?? ""}`.trim()}>
      {showStacked ? (
        <AreaChart data={data} margin={margin} {...mouseHandlers}>
          {grid}
          {xAxis}
          {yAxis}
          <ChartTooltip
            cursor={{ stroke: "var(--border)" }}
            content={<ChartTooltipContent labelFormatter={(v) => formatTick(String(v))} indicator="dot" />}
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
          {brush}
        </AreaChart>
      ) : (
        <LineChart data={data} margin={margin} {...mouseHandlers}>
          {grid}
          {xAxis}
          {yAxis}
          <ChartTooltip
            cursor={{ stroke: "var(--border)" }}
            content={<ChartTooltipContent labelFormatter={(v) => formatTick(String(v))} indicator="line" />}
          />
          {showCompare &&
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
          {brush}
        </LineChart>
      )}
    </ChartContainer>
  );
}
