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

export function TagPicker({ legend, value, onChange, placeholder = "Pick tags" }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const state = useTags();

  const universe = useMemo(() => {
    const all = state.status === "ready" ? state.tags : [];
    // Make sure already-selected tags are always visible in the list even if
    // the universe doesn't include them (e.g. just-typed tag or deleted server-side).
    return Array.from(new Set([...all, ...value])).sort((a, b) => a.localeCompare(b));
  }, [state, value]);

  const trimmedSearch = search.trim().toLowerCase();
  const canCreate =
    trimmedSearch.length > 0 &&
    !universe.some((t) => t.toLowerCase() === trimmedSearch) &&
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
                {(state.status === "ready" || state.status === "unavailable") && (
                  <>
                    {universe.length === 0 && !canCreate && (
                      <CommandEmpty>
                        {state.status === "unavailable" ? "Type a tag to add" : "No tags yet"}
                      </CommandEmpty>
                    )}
                    {universe.length > 0 && (
                      <CommandGroup heading={state.status === "unavailable" ? "Selected" : "Tags"}>
                        {universe.map((tag) => {
                          const isSelected = value.includes(tag);
                          return (
                            <CommandItem
                              key={tag}
                              value={tag}
                              onSelect={() => toggle(tag)}
                              className="flex items-center gap-2"
                            >
                              <Check className={cn("size-4", isSelected ? "opacity-100" : "opacity-0")} />
                              <span className="truncate">{tag}</span>
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
