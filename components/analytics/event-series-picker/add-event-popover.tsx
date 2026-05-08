"use client";

import { Check, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type SeriesId, TYPE_SERIES } from "@/lib/analytics/event-series";

type Props = {
  selected: SeriesId[];
  onToggle: (id: SeriesId) => void;
};

export function AddEventPopover({ selected, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 shrink-0 gap-1 px-2 text-xs">
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
                      onToggle(series.id);
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
  );
}
