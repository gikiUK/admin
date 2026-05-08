"use client";

import { Check, Layers, LineChart as LineChartIcon, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { ChartMode } from "@/components/analytics/events-time-series";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ALL_SERIES_DEF, CATEGORY_SERIES, type SeriesId, TYPE_SERIES } from "@/lib/analytics/event-series";
import { cn } from "@/lib/utils";

type EventSeriesPickerProps = {
  selected: SeriesId[];
  onSelectedChange: (next: SeriesId[]) => void;
  mode: ChartMode;
  onModeChange: (next: ChartMode) => void;
};

export function EventSeriesPicker({ selected, onSelectedChange, mode, onModeChange }: EventSeriesPickerProps) {
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
    <div className="flex flex-wrap items-center gap-2">
      <Chip
        active={allActive}
        color={ALL_SERIES_DEF.color}
        onClick={() => toggle("all")}
        label={ALL_SERIES_DEF.label}
      />
      <span className="h-4 w-px bg-border" aria-hidden />
      {CATEGORY_SERIES.map((series) => (
        <Chip
          key={series.id}
          active={!allActive && selectedSet.has(series.id)}
          color={series.color}
          onClick={() => toggle(series.id)}
          label={series.label}
        />
      ))}
      {selectedTypes.map((series) => (
        <Chip
          key={series.id}
          active
          color={series.color}
          onClick={() => toggle(series.id)}
          label={series.label}
          removable
        />
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
                    <CommandItem key={series.id} value={series.label} onSelect={() => toggle(series.id)}>
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
      <div className="ml-auto inline-flex h-7 items-center rounded-md border bg-background p-0.5 text-xs">
        <ModeButton active={mode === "line"} onClick={() => onModeChange("line")} icon={LineChartIcon} label="Lines" />
        <ModeButton
          active={mode === "stacked"}
          disabled={!canStack}
          onClick={() => onModeChange("stacked")}
          icon={Layers}
          label="Stacked"
        />
      </div>
    </div>
  );
}

type ChipProps = {
  active: boolean;
  color: string;
  label: string;
  onClick: () => void;
  removable?: boolean;
};

function Chip({ active, color, label, onClick, removable }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors",
        active
          ? "border-transparent text-white shadow-sm"
          : "border-border bg-background text-foreground hover:bg-muted"
      )}
      style={active ? { backgroundColor: color } : undefined}
      aria-pressed={active}
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
