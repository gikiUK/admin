"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { fetchWorkshops, type Workshop } from "@/lib/workshops/api";

type Props = {
  selectedUuids: string[];
  onChange: (next: string[]) => void;
};

const WORKSHOP_PAGE_SIZE = 200;

export function WorkshopPicker({ selectedUuids, onChange }: Props) {
  const [workshops, setWorkshops] = useState<Workshop[] | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchWorkshops(1, WORKSHOP_PAGE_SIZE)
      .then((res) => {
        if (cancelled) return;
        setWorkshops(res.workshops);
        setTotalCount(res.meta.total_count);
      })
      .catch(() => {
        if (!cancelled) setWorkshops([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const truncated = totalCount !== null && workshops !== null && totalCount > workshops.length;

  const selectedWorkshops = useMemo(() => {
    if (!workshops) return [];
    return workshops.filter((w) => selectedUuids.includes(w.uuid));
  }, [workshops, selectedUuids]);

  function toggle(uuid: string) {
    const next = selectedUuids.includes(uuid) ? selectedUuids.filter((u) => u !== uuid) : [...selectedUuids, uuid];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Workshops</span>
      <div className="flex flex-wrap gap-1.5">
        {selectedWorkshops.map((w) => (
          <Badge key={w.uuid} variant="secondary" className="gap-1 pl-2 pr-1">
            {w.title}
            <button
              type="button"
              onClick={() => toggle(w.uuid)}
              className="rounded hover:bg-muted-foreground/20"
              aria-label={`Remove ${w.title}`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <ChevronsUpDown className="size-3" />
              {selectedWorkshops.length === 0 ? "Pick workshops" : "Edit"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search workshops…" />
              <CommandList>
                {workshops === null ? (
                  <CommandEmpty>Loading…</CommandEmpty>
                ) : workshops.length === 0 ? (
                  <CommandEmpty>No workshops yet.</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {workshops.map((w) => {
                      const isSelected = selectedUuids.includes(w.uuid);
                      return (
                        <CommandItem
                          key={w.uuid}
                          value={w.title}
                          onSelect={() => toggle(w.uuid)}
                          className="flex items-center gap-2"
                        >
                          <Check className={cn("size-4", isSelected ? "opacity-100" : "opacity-0")} />
                          <span className="truncate">{w.title}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
              </CommandList>
              {truncated && (
                <div className="border-t px-2 py-1.5 text-[11px] text-muted-foreground">
                  Showing {workshops?.length} of {totalCount} workshops (most recent first).
                </div>
              )}
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
