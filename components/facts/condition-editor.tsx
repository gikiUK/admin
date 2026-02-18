"use client";

import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ConstantsLookup, FactsLookup } from "@/lib/blob/resolve";
import { resolveConstantId } from "@/lib/blob/resolve";
import type { AnyCondition, BlobCondition, BlobConstantValue, SimpleCondition } from "@/lib/blob/types";
import { useDataset } from "@/lib/blob/use-dataset";

type ConditionEditorProps = {
  condition: BlobCondition;
  onChange: (condition: BlobCondition) => void;
  factIds: string[];
};

function isAnyCondition(c: BlobCondition): c is AnyCondition {
  return "any" in c;
}

function ConstantPicker({
  values,
  selected,
  onAdd
}: {
  values: BlobConstantValue[];
  selected: (string | number)[];
  onAdd: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedSet = useMemo(() => new Set(selected.map(Number)), [selected]);

  const available = useMemo(() => values.filter((v) => v.enabled && !selectedSet.has(v.id)), [values, selectedSet]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs">
          <Plus className="size-3" /> Add value
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search values..." className="h-8 text-xs" />
          <CommandList>
            <CommandEmpty className="py-2 text-center text-xs text-muted-foreground">No values found.</CommandEmpty>
            {available.map((v) => (
              <CommandItem
                key={v.id}
                value={v.label ?? v.name}
                onSelect={() => {
                  onAdd(v.id);
                  setOpen(false);
                }}
                className="text-xs"
              >
                {v.label ?? v.name}
                <span className="ml-auto font-mono text-muted-foreground">{v.id}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function SimpleConditionRow({
  condition,
  onChange,
  onRemove,
  factIds,
  facts,
  constants
}: {
  condition: SimpleCondition;
  onChange: (c: SimpleCondition) => void;
  onRemove?: () => void;
  factIds: string[];
  facts: FactsLookup;
  constants: ConstantsLookup;
}) {
  const entries = Object.entries(condition);
  const [factName, factValue] = entries[0] ?? ["", ""];
  const isArray = Array.isArray(factValue);

  const fact = facts[factName];
  const constantValues = fact?.values_ref ? constants[fact.values_ref] : undefined;

  function handleFactChange(newFact: string) {
    const val = condition[factName];
    const next: SimpleCondition = { [newFact]: val ?? true };
    onChange(next);
  }

  function handleModeChange(mode: string) {
    if (mode === "array") {
      onChange({ [factName]: [] });
    } else if (mode === "true") {
      onChange({ [factName]: true });
    } else if (mode === "false") {
      onChange({ [factName]: false });
    } else if (mode === "not_applicable") {
      onChange({ [factName]: "not_applicable" });
    }
  }

  function handleAddValue(id: number) {
    if (!isArray) return;
    const arr = factValue as number[];
    if (arr.includes(id)) return;
    onChange({ [factName]: [...arr, id] });
  }

  function handleAddTag(tag: string) {
    if (!isArray) return;
    const arr = factValue as string[];
    if (arr.includes(tag)) return;
    onChange({ [factName]: [...arr, tag] });
  }

  function handleRemoveTag(tag: string | number) {
    if (!isArray) return;
    onChange({ [factName]: (factValue as number[]).filter((t) => t !== tag) } as SimpleCondition);
  }

  const currentMode = isArray ? "array" : String(factValue);

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="flex items-center gap-2">
        <Select value={factName} onValueChange={handleFactChange}>
          <SelectTrigger className="w-[200px] font-mono text-xs">
            <SelectValue placeholder="Select fact..." />
          </SelectTrigger>
          <SelectContent>
            {factIds.map((id) => (
              <SelectItem key={id} value={id} className="font-mono text-xs">
                {id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentMode} onValueChange={handleModeChange}>
          <SelectTrigger className="w-[120px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">= true</SelectItem>
            <SelectItem value="false">= false</SelectItem>
            <SelectItem value="not_applicable">= not applicable</SelectItem>
            <SelectItem value="array">contains</SelectItem>
          </SelectContent>
        </Select>

        {onRemove && (
          <Button variant="ghost" size="icon-xs" onClick={onRemove}>
            <X className="size-3" />
          </Button>
        )}
      </div>

      {isArray && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {(factValue as (string | number)[]).map((tag) => {
              const label = resolveConstantId(tag, factName, facts, constants);
              return (
                <Badge key={String(tag)} variant="secondary" className="gap-1 text-xs">
                  {label}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-destructive">
                    <X className="size-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
          {constantValues ? (
            <ConstantPicker
              values={constantValues}
              selected={factValue as (string | number)[]}
              onAdd={handleAddValue}
            />
          ) : (
            <TagInput onAdd={handleAddTag} />
          )}
        </div>
      )}
    </div>
  );
}

function TagInput({ onAdd }: { onAdd: (tag: string) => void }) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value) {
        onAdd(value);
        e.currentTarget.value = "";
      }
    }
  }

  return <Input placeholder="Type value and press Enter..." className="h-7 text-xs" onKeyDown={handleKeyDown} />;
}

export function ConditionEditor({ condition, onChange, factIds }: ConditionEditorProps) {
  const { blob } = useDataset();
  const facts = blob?.facts ?? {};
  const constants = blob?.constants ?? {};
  const isAny = isAnyCondition(condition);

  function handleConvertToAny() {
    const simple = condition as SimpleCondition;
    onChange({ any: [simple] });
  }

  function handleConvertToSimple() {
    const any = condition as AnyCondition;
    onChange(any.any[0] ?? { "": true });
  }

  if (isAny) {
    const anyCondition = condition as AnyCondition;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Any of (OR):</span>
          <Button variant="ghost" size="xs" onClick={handleConvertToSimple}>
            Switch to simple
          </Button>
        </div>
        {anyCondition.any.map((c, i) => (
          <SimpleConditionRow
            key={`any-${Object.keys(c).join("-")}-${i}`}
            condition={c}
            onChange={(updated) => {
              const next = [...anyCondition.any];
              next[i] = updated;
              onChange({ any: next });
            }}
            onRemove={
              anyCondition.any.length > 1
                ? () => {
                    const next = anyCondition.any.filter((_, j) => j !== i);
                    onChange({ any: next });
                  }
                : undefined
            }
            factIds={factIds}
            facts={facts}
            constants={constants}
          />
        ))}
        <Button variant="outline" size="sm" onClick={() => onChange({ any: [...anyCondition.any, { "": true }] })}>
          <Plus className="size-3" /> Add condition
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">When:</span>
        <Button variant="ghost" size="xs" onClick={handleConvertToAny}>
          Switch to any-of (OR)
        </Button>
      </div>
      <SimpleConditionRow
        condition={condition as SimpleCondition}
        onChange={(updated) => onChange(updated)}
        factIds={factIds}
        facts={facts}
        constants={constants}
      />
    </div>
  );
}
