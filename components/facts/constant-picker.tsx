"use client";

import { Check, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { BlobConstantValue } from "@/lib/blob/types";

export function ConstantPicker({
  values,
  selected,
  onToggle
}: {
  values: BlobConstantValue[];
  selected: (string | number)[];
  onToggle: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedSet = useMemo(() => new Set(selected.map(Number)), [selected]);
  const enabled = useMemo(() => values.filter((v) => v.enabled), [values]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs">
          <Plus className="size-3" /> Add value
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" side="right" align="start">
        <Command>
          <CommandInput placeholder="Search values..." className="h-8 text-xs" />
          <CommandList>
            <CommandEmpty className="py-2 text-center text-xs text-muted-foreground">No values found.</CommandEmpty>
            {enabled.map((v) => {
              const isSelected = selectedSet.has(v.id);
              return (
                <CommandItem key={v.id} value={v.label ?? v.name} onSelect={() => onToggle(v.id)} className="text-xs">
                  {isSelected && <Check className="size-3 text-primary" />}
                  <span className={isSelected ? "font-medium" : ""}>{v.label ?? v.name}</span>
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
