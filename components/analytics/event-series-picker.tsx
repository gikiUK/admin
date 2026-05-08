"use client";

import { CalendarClock, Check, Layers, LineChart as LineChartIcon, Plus, TrendingUp, X } from "lucide-react";
import { type ComponentPropsWithoutRef, forwardRef, useMemo, useState } from "react";
import type { ChartMode } from "@/components/analytics/events-time-series";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ALL_SERIES_DEF,
  CATEGORY_SERIES,
  coveredEventLabels,
  type SeriesDef,
  type SeriesId,
  TYPE_SERIES
} from "@/lib/analytics/event-series";
import { cn } from "@/lib/utils";

type EventSeriesPickerProps = {
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
}: EventSeriesPickerProps) {
  const [open, setOpen] = useState(false);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const allActive = selected.length === 0 || (selected.length === 1 && selected[0] === "all");

  const selectedTypes = useMemo(() => TYPE_SERIES.filter((s) => selectedSet.has(s.id)), [selectedSet]);

  function toggle(id: SeriesId) {
    if (id === "all") {
      onSelectedChange([]);
      return;
    }
    const withoutAll = selected.filter((s) => s !== "all");
    const next = withoutAll.includes(id) ? withoutAll.filter((s) => s !== id) : [...withoutAll, id];
    onSelectedChange(next);
  }

  function clear() {
    onSelectedChange([]);
  }

  const canStack = !allActive && selected.length > 1;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-wrap items-center gap-2">
        <ChipWithTooltip series={ALL_SERIES_DEF} active={allActive} onClick={() => toggle("all")} />
        <span className="h-4 w-px bg-border" aria-hidden />
        {CATEGORY_SERIES.map((series) => (
          <ChipWithTooltip
            key={series.id}
            series={series}
            active={!allActive && selectedSet.has(series.id)}
            onClick={() => toggle(series.id)}
          />
        ))}
        {selectedTypes.map((series) => (
          <ChipWithTooltip key={series.id} series={series} active onClick={() => toggle(series.id)} removable />
        ))}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs">
              <Plus className="size-3" />
              Add event
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-0">
            <Command>
              <CommandInput placeholder="Search event types…" />
              <CommandList>
                <CommandEmpty>No events found.</CommandEmpty>
                <CommandGroup>
                  {TYPE_SERIES.map((series) => {
                    const active = selectedSet.has(series.id);
                    return (
                      <CommandItem
                        key={series.id}
                        value={series.label}
                        onSelect={() => {
                          toggle(series.id);
                          setOpen(false);
                        }}
                      >
                        <span
                          className="size-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: series.color }}
                          aria-hidden
                        />
                        <span className="flex-1 truncate">{series.label}</span>
                        {active && <Check className="size-3.5 text-foreground" />}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {!allActive && (
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-muted-foreground" onClick={clear}>
            <X className="size-3" />
            Clear
          </Button>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          <ToggleButton
            active={smooth}
            onClick={() => onSmoothChange(!smooth)}
            icon={TrendingUp}
            label="7d avg"
            title="Smooth with 7-day rolling average"
          />
          <ToggleButton
            active={compare}
            disabled={compareDisabled}
            onClick={() => onCompareChange(!compare)}
            icon={CalendarClock}
            label="Compare"
            title={compareDisabled ? "Switch to Lines to enable compare" : "Overlay previous equal-length window"}
          />
          <div className="inline-flex h-7 items-center rounded-md border bg-background p-0.5 text-xs">
            <ModeButton
              active={mode === "line"}
              onClick={() => onModeChange("line")}
              icon={LineChartIcon}
              label="Lines"
            />
            <ModeButton
              active={mode === "stacked"}
              disabled={!canStack}
              onClick={() => onModeChange("stacked")}
              icon={Layers}
              label="Stacked"
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

type ChipWithTooltipProps = {
  series: SeriesDef;
  active: boolean;
  onClick: () => void;
  removable?: boolean;
};

function ChipWithTooltip({ series, active, onClick, removable }: ChipWithTooltipProps) {
  const covered = useMemo(() => coveredEventLabels(series), [series]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Chip active={active} color={series.color} label={series.label} onClick={onClick} removable={removable} />
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="font-medium">{series.label}</div>
        {series.kind === "all" ? (
          <div className="mt-1 text-muted-foreground">All event types across every category.</div>
        ) : series.kind === "category" ? (
          <ul className="mt-1.5 grid gap-0.5 text-muted-foreground">
            {covered.map((eventLabel) => (
              <li key={eventLabel}>· {eventLabel}</li>
            ))}
          </ul>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}

type ChipProps = {
  active: boolean;
  color: string;
  label: string;
  removable?: boolean;
} & ComponentPropsWithoutRef<"button">;

const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { active, color, label, removable, className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors",
        active
          ? "border-transparent text-white shadow-sm"
          : "border-border bg-background text-foreground hover:bg-muted",
        className
      )}
      style={active ? { backgroundColor: color } : undefined}
      aria-pressed={active}
      {...props}
    >
      <span
        className={cn("size-2 shrink-0 rounded-full", active ? "bg-white/80" : "")}
        style={!active ? { backgroundColor: color } : undefined}
        aria-hidden
      />
      {label}
      {removable && active && <X className="size-3 opacity-80" />}
    </button>
  );
});

type ToggleButtonProps = {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: typeof LineChartIcon;
  label: string;
  title?: string;
};

function ToggleButton({ active, disabled, onClick, icon: Icon, label, title }: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-md border px-2 text-xs transition-colors",
        active
          ? "border-primary/40 bg-primary/10 text-foreground"
          : "border-border bg-background text-muted-foreground hover:text-foreground",
        disabled && "cursor-not-allowed opacity-50 hover:text-muted-foreground"
      )}
      aria-pressed={active}
      title={title ?? label}
    >
      <Icon className="size-3" />
      {label}
    </button>
  );
}

type ModeButtonProps = {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: typeof LineChartIcon;
  label: string;
};

function ModeButton({ active, disabled, onClick, icon: Icon, label }: ModeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-sm px-2 transition-colors",
        active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground",
        disabled && "cursor-not-allowed opacity-50 hover:text-muted-foreground"
      )}
      aria-pressed={active}
      title={label}
    >
      <Icon className="size-3" />
      {label}
    </button>
  );
}
