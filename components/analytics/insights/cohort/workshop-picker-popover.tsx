"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Workshop } from "@/lib/workshops/api";

type Props = {
  workshops: Workshop[] | null;
  totalCount: number | null;
  selectedUuids: string[];
  triggerLabel: string;
  onToggle: (uuid: string) => void;
};

export function WorkshopPickerPopover({ workshops, totalCount, selectedUuids, triggerLabel, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const truncated = totalCount !== null && workshops !== null && totalCount > workshops.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs">
          <ChevronsUpDown className="size-3" />
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start" portal={false}>
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
                      onSelect={() => onToggle(w.uuid)}
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
  );
}
