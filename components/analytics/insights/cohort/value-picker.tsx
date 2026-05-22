"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import type { OptionPair } from "@/components/analytics/insights/cohort/fact-filter-options";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  options: OptionPair[];
  selectedKeys: string[];
  onToggle: (value: string | number | boolean) => void;
  triggerLabel?: string;
};

export function ValuePicker({ options, selectedKeys, onToggle, triggerLabel = "Add value" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
          <ChevronsUpDown className="size-3" />
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start" portal={false}>
        <Command>
          <CommandInput placeholder="Search values…" />
          <CommandList>
            {options.length === 0 ? (
              <CommandEmpty>No options for this question.</CommandEmpty>
            ) : (
              <CommandGroup>
                {options.map((opt) => {
                  const optKey = String(opt.value);
                  const isSelected = selectedKeys.includes(optKey);
                  return (
                    <CommandItem
                      key={optKey}
                      value={opt.label}
                      onSelect={() => {
                        onToggle(opt.value);
                        setOpen(false);
                      }}
                    >
                      <Check className={cn("size-4", isSelected ? "opacity-100" : "opacity-0")} />
                      <span>{opt.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
