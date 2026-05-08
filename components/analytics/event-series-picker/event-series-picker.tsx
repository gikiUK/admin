"use client";

import { useCallback } from "react";
import type { ChartMode } from "@/components/analytics/events-time-series";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { SeriesId } from "@/lib/analytics/event-series";
import { AddEventPopover } from "./add-event-popover";
import { ChartControls } from "./chart-controls";
import { isAllActive, toggleSeries } from "./selection";
import { SeriesStrip } from "./series-strip";

type Props = {
  selected: SeriesId[];
  onSelectedChange: (next: SeriesId[]) => void;
  mode: ChartMode;
  onModeChange: (next: ChartMode) => void;
  smooth: boolean;
  onSmoothChange: (next: boolean) => void;
  compare: boolean;
  onCompareChange: (next: boolean) => void;
  compareDisabled: boolean;
};

export function EventSeriesPicker({
  selected,
  onSelectedChange,
  mode,
  onModeChange,
  smooth,
  onSmoothChange,
  compare,
  onCompareChange,
  compareDisabled
}: Props) {
  const allActive = isAllActive(selected);
  const stackDisabled = allActive || selected.length <= 1;

  const handleToggle = useCallback(
    (id: SeriesId) => onSelectedChange(toggleSeries(selected, id)),
    [selected, onSelectedChange]
  );

  const handleClear = useCallback(() => onSelectedChange([]), [onSelectedChange]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex w-full select-none items-center justify-between gap-2">
        <div className="flex min-w-0 shrink items-center gap-2">
          <SeriesStrip selected={selected} onToggle={handleToggle} onClear={handleClear} />
          <AddEventPopover selected={selected} onToggle={handleToggle} />
        </div>
        <ChartControls
          mode={mode}
          onModeChange={onModeChange}
          smooth={smooth}
          onSmoothChange={onSmoothChange}
          compare={compare}
          onCompareChange={onCompareChange}
          compareDisabled={compareDisabled}
          stackDisabled={stackDisabled}
        />
      </div>
    </TooltipProvider>
  );
}
