"use client";

import { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { coveredEventLabels, type SeriesDef } from "@/lib/analytics/event-series";
import { Chip } from "./chip";

type Props = {
  series: SeriesDef;
  active: boolean;
  onClick: () => void;
  removable?: boolean;
};

export function ChipWithTooltip({ series, active, onClick, removable }: Props) {
  const covered = useMemo(() => coveredEventLabels(series), [series]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Chip active={active} color={series.color} label={series.label} onClick={onClick} removable={removable} />
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="font-medium">{series.label}</div>
        {series.kind === "all" && (
          <div className="mt-1 text-muted-foreground">All event types across every category.</div>
        )}
        {series.kind === "category" && (
          <ul className="mt-1.5 grid gap-0.5 text-muted-foreground">
            {covered.map((label) => (
              <li key={label}>· {label}</li>
            ))}
          </ul>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
