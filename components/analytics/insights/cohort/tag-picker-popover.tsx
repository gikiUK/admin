"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";
import type { TagEntry } from "@/components/analytics/insights/cohort/tag-picker-universe";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { useTags } from "@/lib/tags/use-tags";
import { cn } from "@/lib/utils";

type Props = {
  state: ReturnType<typeof useTags>;
  universe: TagEntry[];
  value: string[];
  triggerLabel: string;
  onToggle: (tag: string) => void;
  onCreate: (tag: string) => void;
};

export function TagPickerPopover({ state, universe, value, triggerLabel, onToggle, onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const trimmed = search.trim().toLowerCase();
  const canCreate =
    trimmed.length > 0 && !universe.some((t) => t.name.toLowerCase() === trimmed) && !value.includes(trimmed);

  function handleToggle(tag: string) {
    onToggle(tag);
    setOpen(false);
    setSearch("");
  }

  function handleCreate() {
    if (!canCreate) return;
    onCreate(trimmed);
    setSearch("");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs">
          <ChevronsUpDown className="size-3" />
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start" portal={false}>
        <Command>
          <CommandInput placeholder="Search tags…" value={search} onValueChange={setSearch} />
          <CommandList>
            {state.status === "loading" && <CommandEmpty>Loading tags…</CommandEmpty>}
            {state.status === "error" && <CommandEmpty>{state.message}</CommandEmpty>}
            {state.status === "ready" && (
              <>
                {universe.length === 0 && !canCreate && <CommandEmpty>No tags yet</CommandEmpty>}
                {universe.length > 0 && (
                  <CommandGroup heading="Tags">
                    {universe.map((entry) => {
                      const isSelected = value.includes(entry.name);
                      return (
                        <CommandItem
                          key={entry.name}
                          value={entry.name}
                          onSelect={() => handleToggle(entry.name)}
                          className="flex items-center gap-2"
                        >
                          <Check className={cn("size-4", isSelected ? "opacity-100" : "opacity-0")} />
                          <span className="truncate flex-1">{entry.name}</span>
                          {entry.count > 0 && (
                            <span className="text-xs text-muted-foreground tabular-nums">{entry.count}</span>
                          )}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
                {canCreate && (
                  <CommandGroup heading="Create">
                    <CommandItem value={`__create__${trimmed}`} onSelect={handleCreate}>
                      <Plus className="size-4" />
                      <span>
                        Create tag <span className="font-medium">"{trimmed}"</span>
                      </span>
                    </CommandItem>
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
