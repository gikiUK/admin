"use client";

import { CalendarClock, Layers, LineChart as LineChartIcon, TrendingUp } from "lucide-react";
import type { ChartMode } from "@/components/analytics/events-time-series";
import { IconToggle } from "./icon-toggle";

type Props = {
  mode: ChartMode;
  onModeChange: (next: ChartMode) => void;
  smooth: boolean;
  onSmoothChange: (next: boolean) => void;
  compare: boolean;
  onCompareChange: (next: boolean) => void;
  compareDisabled: boolean;
  stackDisabled: boolean;
};

export function ChartControls({
  mode,
  onModeChange,
  smooth,
  onSmoothChange,
  compare,
  onCompareChange,
  compareDisabled,
  stackDisabled
}: Props) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <IconToggle
        active={smooth}
        onClick={() => onSmoothChange(!smooth)}
        icon={TrendingUp}
        label="7d avg"
        title="Smooth with 7-day rolling average"
      />
      <IconToggle
        active={compare}
        disabled={compareDisabled}
        onClick={() => onCompareChange(!compare)}
        icon={CalendarClock}
        label="Compare"
        title={compareDisabled ? "Switch to Lines to enable compare" : "Overlay previous equal-length window"}
      />
      <div className="inline-flex h-7 items-center rounded-md border bg-background p-0.5 text-xs">
        <IconToggle
          variant="segmented"
          active={mode === "line"}
          onClick={() => onModeChange("line")}
          icon={LineChartIcon}
          label="Lines"
        />
        <IconToggle
          variant="segmented"
          active={mode === "stacked"}
          disabled={stackDisabled}
          onClick={() => onModeChange("stacked")}
          icon={Layers}
          label="Stacked"
        />
      </div>
    </div>
  );
}
