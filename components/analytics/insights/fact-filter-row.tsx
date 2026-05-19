"use client";

import type { Dataset } from "@gikiuk/facts-engine";
import { Check, ChevronsUpDown, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { FactFilter } from "@/lib/analytics/insights/cohort-spec";
import { cn } from "@/lib/utils";

type Props = {
  filter: FactFilter;
  dataset: Dataset | null;
  onChange: (next: FactFilter) => void;
  onRemove: () => void;
};

type OptionPair = { value: string; label: string };

export function FactFilterRow({ filter, dataset, onChange, onRemove }: Props) {
  const [keyOpen, setKeyOpen] = useState(false);
  const [valueOpen, setValueOpen] = useState(false);

  const question = useMemo(() => {
    if (!dataset) return null;
    return dataset.data.questions.find((q) => q.key === filter.key) ?? null;
  }, [dataset, filter.key]);

  const options: OptionPair[] = useMemo(() => {
    if (!dataset || !question) return [];
    if (question.options?.length) {
      return question.options.map((o) => ({ value: o.value, label: o.label }));
    }
    if (question.options_ref && dataset.data.constants[question.options_ref]) {
      return dataset.data.constants[question.options_ref]
        .filter((c) => c.enabled)
        .map((c) => ({ value: c.name, label: c.label ?? c.name }));
    }
    return [];
  }, [dataset, question]);

  const selectedValues = filter.values.map(String);

  function setKey(key: string) {
    onChange({ key, values: [] });
    setKeyOpen(false);
  }

  function toggleValue(value: string) {
    const next = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange({ key: filter.key, values: next });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border bg-card px-3 py-2">
      <Popover open={keyOpen} onOpenChange={setKeyOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <ChevronsUpDown className="size-3" />
            {question?.label ?? filter.key ?? "Pick question"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-0" align="start">
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
                        onSelect={() => setKey(q.key)}
                        className="flex flex-col items-start gap-0.5 py-2"
                      >
                        <span className="text-sm">{q.label}</span>
                        <span className="text-[10px] text-muted-foreground">{q.key}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <span className="text-xs text-muted-foreground">is any of</span>

      <div className="flex flex-wrap items-center gap-1">
        {selectedValues.map((value) => {
          const label = options.find((o) => o.value === value)?.label ?? value;
          return (
            <Badge key={value} variant="secondary" className="gap-1 pl-2 pr-1">
              {label}
              <button
                type="button"
                onClick={() => toggleValue(value)}
                className="rounded hover:bg-muted-foreground/20"
                aria-label={`Remove ${label}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          );
        })}

        {filter.key && (
          <Popover open={valueOpen} onOpenChange={setValueOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                <ChevronsUpDown className="size-3" />
                Add value
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search values…" />
                <CommandList>
                  {options.length === 0 ? (
                    <CommandEmpty>No options for this question.</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {options.map((opt) => {
                        const isSelected = selectedValues.includes(opt.value);
                        return (
                          <CommandItem key={opt.value} value={opt.label} onSelect={() => toggleValue(opt.value)}>
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
        )}
      </div>

      <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove fact filter" className="ml-auto size-7">
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
