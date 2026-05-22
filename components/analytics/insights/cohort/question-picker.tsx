"use client";

import type { Dataset } from "@gikiuk/facts-engine";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  dataset: Dataset | null;
  selectedKey: string;
  selectedLabel?: string;
  onSelect: (key: string) => void;
};

export function QuestionPicker({ dataset, selectedKey, selectedLabel, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-xs">
          <ChevronsUpDown className="size-3" />
          {selectedLabel ?? selectedKey ?? "Pick question"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="start" portal={false}>
        <Command>
          <CommandInput placeholder="Search questions…" />
          <CommandList>
            {dataset === null ? (
              <CommandEmpty>Loading dataset…</CommandEmpty>
            ) : (
              <CommandGroup>
                {dataset.data.questions
                  .filter((q) => q.enabled)
                  .map((q) => (
                    <CommandItem
                      key={q.key}
                      value={`${q.label} ${q.key}`}
                      onSelect={() => {
                        onSelect(q.key);
                        setOpen(false);
                      }}
                      className="flex flex-col items-start gap-0.5 py-2"
                    >
                      <span className="text-sm">{q.label}</span>
                      <span className="text-xs text-muted-foreground">{q.key}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
