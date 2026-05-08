"use client";

import { X } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ALL_SERIES_DEF, CATEGORY_SERIES, type SeriesId, TYPE_SERIES } from "@/lib/analytics/event-series";
import { ChipWithTooltip } from "./chip-with-tooltip";

const FADE_MASK = "linear-gradient(to right, black calc(100% - 24px), transparent 100%)";

type Props = {
  selected: SeriesId[];
  onToggle: (id: SeriesId) => void;
  onClear: () => void;
};

export function SeriesStrip({ selected, onToggle, onClear }: Props) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const selectedTypes = useMemo(() => TYPE_SERIES.filter((s) => selectedSet.has(s.id)), [selectedSet]);
  const allActive = selectedSet.has("all");
  const hasNonDefaultSelection = selected.length > 1 || (selected.length === 1 && !allActive);

  return (
    <div
      className="relative flex min-w-0 max-w-[420px] items-center overflow-hidden"
      style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
    >
      <div
        className="flex min-w-0 items-center gap-2 overflow-x-auto pr-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        <ChipWithTooltip series={ALL_SERIES_DEF} active={allActive} onClick={() => onToggle("all")} />
        <span className="h-4 w-px shrink-0 bg-border" aria-hidden />
        {CATEGORY_SERIES.map((series) => (
          <ChipWithTooltip
            key={series.id}
            series={series}
            active={selectedSet.has(series.id)}
            onClick={() => onToggle(series.id)}
          />
        ))}
        {selectedTypes.map((series) => (
          <ChipWithTooltip key={series.id} series={series} active onClick={() => onToggle(series.id)} removable />
        ))}
        {hasNonDefaultSelection && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 gap-1 px-2 text-xs text-muted-foreground"
            onClick={onClear}
          >
            <X className="size-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
