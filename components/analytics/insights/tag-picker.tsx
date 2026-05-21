"use client";

import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTags } from "@/lib/manage/use-tags";
import { cn } from "@/lib/utils";

type Props = {
  legend: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
};

type Entry = { name: string; count: number };

export function TagPicker({ legend, value, onChange, placeholder = "Pick tags" }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const state = useTags();

  const universe = useMemo<Entry[]>(() => {
    const fromApi: Entry[] = state.status === "ready" ? state.tags : [];
    const known = new Set(fromApi.map((t) => t.name));
    // Surface already-selected tags that aren't in the API response (e.g. brand-new
    // or just-removed elsewhere) so the user can still see/deselect them.
    const orphans: Entry[] = value.filter((v) => !known.has(v)).map((name) => ({ name, count: 0 }));
    return [...fromApi, ...orphans].sort((a, b) => a.name.localeCompare(b.name));
  }, [state, value]);

  const trimmedSearch = search.trim().toLowerCase();
  const canCreate =
    trimmedSearch.length > 0 &&
    !universe.some((t) => t.name.toLowerCase() === trimmedSearch) &&
    !value.includes(trimmedSearch);

  function toggle(tag: string) {
    const next = value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag];
    onChange(next);
  }

  function createAndAdd() {
    if (!canCreate) return;
    onChange([...value, trimmedSearch]);
    setSearch("");
  }

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{legend}</span>
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
          <PopoverContent className="w-[280px] p-0" align="start">
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
                              onSelect={() => toggle(entry.name)}
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
                        <CommandItem value={`__create__${trimmedSearch}`} onSelect={createAndAdd}>
                          <Plus className="size-4" />
                          <span>
                            Create tag <span className="font-medium">"{trimmedSearch}"</span>
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
    </div>
  );
}
