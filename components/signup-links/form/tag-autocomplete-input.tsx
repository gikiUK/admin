"use client";

import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { TagWithCount } from "@/lib/tags/api";
import { cn } from "@/lib/utils";

type UniverseState =
  | { status: "loading" }
  | { status: "ready"; value: TagWithCount[] }
  | { status: "error"; message: string };

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  universe: UniverseState;
  placeholder?: string;
};

export function TagAutocompleteInput({ value, onChange, universe, placeholder = "Add tag" }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const trimmed = search.trim();
  const universeItems = universe.status === "ready" ? universe.value : [];
  const orphans = value.filter((v) => !universeItems.some((u) => u.name === v)).map((name) => ({ name, count: 0 }));
  const allOptions = [...universeItems, ...orphans].sort((a, b) => a.name.localeCompare(b.name));
  const canCreate =
    trimmed.length > 0 &&
    !allOptions.some((t) => t.name.toLowerCase() === trimmed.toLowerCase()) &&
    !value.includes(trimmed);

  function toggle(tag: string) {
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]);
  }

  function handleCreate() {
    if (!canCreate) return;
    onChange([...value, trimmed]);
    setSearch("");
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 pl-2 pr-1">
          {tag}
          <button
            type="button"
            onClick={() => toggle(tag)}
            className="rounded hover:bg-muted-foreground/20"
            aria-label={`Remove ${tag}`}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            <ChevronsUpDown className="size-3" />
            {value.length === 0 ? placeholder : "Edit"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start" portal={false}>
          <Command>
            <CommandInput placeholder="Search…" value={search} onValueChange={setSearch} />
            <CommandList>
              {universe.status === "loading" && <CommandEmpty>Loading…</CommandEmpty>}
              {universe.status === "error" && <CommandEmpty>{universe.message}</CommandEmpty>}
              {universe.status === "ready" && (
                <>
                  {allOptions.length === 0 && !canCreate && <CommandEmpty>No tags yet</CommandEmpty>}
                  {allOptions.length > 0 && (
                    <CommandGroup>
                      {allOptions.map((entry) => {
                        const isSelected = value.includes(entry.name);
                        return (
                          <CommandItem
                            key={entry.name}
                            value={entry.name}
                            onSelect={() => toggle(entry.name)}
                            className="flex items-center gap-2"
                          >
                            <Check className={cn("size-4", isSelected ? "opacity-100" : "opacity-0")} />
                            <span className="flex-1 truncate">{entry.name}</span>
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
                          Create <span className="font-medium">"{trimmed}"</span>
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
    </div>
  );
}
