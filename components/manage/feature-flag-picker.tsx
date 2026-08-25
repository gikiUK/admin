"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFeatureFlagCatalogue } from "@/lib/feature-flags/use-catalogue";
import { cn } from "@/lib/utils";

type FeatureFlagPickerProps = {
  enabled: string[];
  pending: string | null;
  onToggle: (flag: string) => void;
};

export function FeatureFlagPicker({ enabled, pending, onToggle }: FeatureFlagPickerProps) {
  const [open, setOpen] = useState(false);
  const state = useFeatureFlagCatalogue();
  const catalogue = state.status === "ready" ? state.value : [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <ChevronsUpDown className="size-3" />
          Toggle flags
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search flags…" />
          <CommandList>
            {state.status === "loading" && <CommandEmpty>Loading…</CommandEmpty>}
            {state.status === "error" && <CommandEmpty>{state.message}</CommandEmpty>}
            {state.status === "ready" &&
              (catalogue.length === 0 ? (
                <CommandEmpty>No flags available.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {catalogue.map((flag) => (
                    <CommandItem
                      key={flag}
                      value={flag}
                      disabled={pending !== null}
                      onSelect={() => onToggle(flag)}
                      className="flex items-center gap-2"
                    >
                      <Check className={cn("size-4", enabled.includes(flag) ? "opacity-100" : "opacity-0")} />
                      <span className="truncate font-mono text-xs">{flag}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
