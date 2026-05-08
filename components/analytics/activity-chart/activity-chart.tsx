"use client";

import { Inbox, MousePointerClick, Undo2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { EventSeriesPicker } from "@/components/analytics/event-series-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { unionTotal } from "@/lib/analytics/event-series";
import { ChartCanvas } from "./chart-canvas";
import { ChartHeader } from "./chart-header";
import { ChartPlaceholder } from "./chart-placeholder";
import { trimLeadingZeros } from "./format";
import { buildChartConfig, buildPoints, resolveSeries } from "./series-resolution";
import type { ActivityChartProps } from "./types";
import { useChartZoom } from "./use-chart-zoom";

export function ActivityChart({
  title = "Activity",
  data,
  previousData = null,
  selected,
  mode,
  smooth,
  compare,
  onSelectedChange,
  onModeChange,
  onSmoothChange,
  onCompareChange,
  onPointClick
}: ActivityChartProps) {
  const seriesDefs = useMemo(() => resolveSeries(selected), [selected]);
  const showStacked = mode === "stacked" && seriesDefs.length > 1;
  const compareActive = compare && !showStacked && previousData !== null;

  const chartConfig = useMemo(() => buildChartConfig(seriesDefs, compareActive), [seriesDefs, compareActive]);
  const points = useMemo(
    () => buildPoints({ data, previousData, seriesDefs, compareActive, smooth }),
    [data, previousData, seriesDefs, compareActive, smooth]
  );

  const seriesKeys = useMemo(() => seriesDefs.map((s) => s.key), [seriesDefs]);
  const trimmed = useMemo(() => trimLeadingZeros(points, seriesKeys), [points, seriesKeys]);

  const grandTotal = useMemo(() => unionTotal(data, seriesDefs), [data, seriesDefs]);
  const previousTotal = useMemo(() => {
    if (!compareActive || !previousData) return null;
    return unionTotal(previousData, seriesDefs);
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
  const heightClass = showBrush ? "h-[340px]" : "h-[280px]";

  const zoom = useChartZoom({ totalLength: trimmed.length, onPointClick });
  const cursorClass = onPointClick || trimmed.length > 1 ? "cursor-crosshair" : undefined;

  const seriesKeysSignature = seriesKeys.join("|");
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset zoom when the series selection changes
  useEffect(() => {
    zoom.reset();
  }, [seriesKeysSignature]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3">
        <ChartHeader title={title} total={hasNoSelection ? null : grandTotal} delta={hasNoSelection ? null : delta} />
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
            heightClass={heightClass}
          />
        )}
        {hasNoData && (
          <ChartPlaceholder
            icon={Inbox}
            title="No events in this selection"
            description="Try a different date range, or pick another event group."
            heightClass={heightClass}
          />
        )}
        {hasData && (
          <div className="space-y-2">
            <div className="flex h-6 items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {zoom.zoom ? "Drag the slider below to adjust" : "Drag on the chart to zoom"}
              </span>
              {zoom.zoom && (
                <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs" onClick={zoom.reset}>
                  <Undo2 className="size-3" />
                  Reset zoom
                </Button>
              )}
            </div>
            <ChartCanvas
              data={trimmed}
              seriesDefs={seriesDefs}
              chartConfig={chartConfig}
              showStacked={showStacked}
              showBrush={showBrush}
              showCompare={compareActive}
              cursorClass={cursorClass}
              heightClass={heightClass}
              zoom={zoom}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
