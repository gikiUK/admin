"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";
import { useFeatureFlagCatalogue } from "@/components/signup-links/form/use-form-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
};

export function FeatureFlagMultiselect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const state = useFeatureFlagCatalogue();
  const catalogue = state.status === "ready" ? state.value : [];

  function toggle(flag: string) {
    onChange(value.includes(flag) ? value.filter((f) => f !== flag) : [...value, flag]);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {value.map((flag) => (
        <Badge key={flag} variant="secondary" className="gap-1 pl-2 pr-1">
          {flag}
          <button
            type="button"
            onClick={() => toggle(flag)}
            className="rounded hover:bg-muted-foreground/20"
            aria-label={`Remove ${flag}`}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            <ChevronsUpDown className="size-3" />
            {value.length === 0 ? "Pick flags" : "Edit"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[260px] p-0" align="start" portal={false}>
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
                    {catalogue.map((flag) => {
                      const isSelected = value.includes(flag);
                      return (
                        <CommandItem
                          key={flag}
                          value={flag}
                          onSelect={() => toggle(flag)}
                          className="flex items-center gap-2"
                        >
                          <Check className={cn("size-4", isSelected ? "opacity-100" : "opacity-0")} />
                          <span className="truncate">{flag}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
