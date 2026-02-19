"use client";

import { Check, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ConstantsLookup, FactsLookup } from "@/lib/blob/resolve";
import { resolveConstantId } from "@/lib/blob/resolve";
import type { AnyCondition, BlobCondition, BlobConstantValue, FactType, SimpleCondition } from "@/lib/blob/types";
import { useDataset } from "@/lib/blob/use-dataset";
import { GateAnd, GateOr, GateSingle } from "./logic-gate-icons";

// ── Mode helpers ────────────────────────────────────────────

type ConditionMode = "single" | "and" | "or";

function isAnyCondition(c: BlobCondition): c is AnyCondition {
  return "any" in c;
}

function getMode(c: BlobCondition): ConditionMode {
  if (isAnyCondition(c)) return "or";
  return Object.keys(c).length > 1 ? "and" : "single";
}

function splitSimple(c: SimpleCondition): SimpleCondition[] {
  return Object.entries(c).map(([k, v]) => ({ [k]: v }));
}

function mergeSimple(conditions: SimpleCondition[]): SimpleCondition {
  const merged: SimpleCondition = {};
  for (const c of conditions) {
    for (const [k, v] of Object.entries(c)) {
      merged[k] = v;
    }
  }
  return merged;
}

function getSubs(c: BlobCondition, mode: ConditionMode): SimpleCondition[] {
  if (mode === "or") return (c as AnyCondition).any;
  if (mode === "and") return splitSimple(c as SimpleCondition);
  return [c as SimpleCondition];
}

function buildCondition(mode: ConditionMode, subs: SimpleCondition[]): BlobCondition {
  if (mode === "or") return { any: subs };
  if (mode === "and") return mergeSimple(subs);
  return subs[0] ?? { "": true };
}

// ── Value helpers ───────────────────────────────────────────

function getOperatorsForType(type?: FactType): { value: string; label: string }[] {
  if (type === "boolean_state") {
    return [
      { value: "true", label: "= true" },
      { value: "false", label: "= false" },
      { value: "not_applicable", label: "= not applicable" }
    ];
  }
  if (type === "enum" || type === "array") {
    return [
      { value: "array", label: "contains" },
      { value: "not_applicable", label: "= not applicable" }
    ];
  }
  return [
    { value: "true", label: "= true" },
    { value: "false", label: "= false" },
    { value: "not_applicable", label: "= not applicable" },
    { value: "array", label: "contains" }
  ];
}

function defaultValueForType(type?: FactType): boolean | string | number[] {
  if (type === "enum" || type === "array") return [];
  return true;
}

// ── Sub-components ──────────────────────────────────────────

function ConstantPicker({
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
  const operators = getOperatorsForType(fact?.type);
  const currentMode = isArray ? "array" : String(factValue);

  function handleFactChange(newFact: string) {
    const newFactDef = facts[newFact];
    const oldType = fact?.type;
    const newType = newFactDef?.type;
    const sameValuesRef = fact?.values_ref && newFactDef?.values_ref && fact.values_ref === newFactDef.values_ref;

    if (oldType === newType && sameValuesRef) {
      onChange({ [newFact]: condition[factName] ?? defaultValueForType(newType) });
    } else {
      onChange({ [newFact]: defaultValueForType(newType) });
    }
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

  function handleToggleValue(id: number) {
    if (!isArray) return;
    const arr = factValue as number[];
    if (arr.includes(id)) {
      onChange({ [factName]: arr.filter((v) => v !== id) });
    } else {
      onChange({ [factName]: [...arr, id] });
    }
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
          <SelectTrigger className="w-[140px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {operators.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {onRemove && (
          <Button variant="ghost" size="icon-xs" onClick={onRemove}>
            <X className="size-3" />
          </Button>
        )}
      </div>

      {isArray && (
        <div className="space-y-2 pl-10">
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
              onToggle={handleToggleValue}
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

// ── Main editor ─────────────────────────────────────────────

type ConditionEditorProps = {
  condition: BlobCondition;
  onChange: (condition: BlobCondition) => void;
  factIds: string[];
};

export function ConditionEditor({ condition, onChange, factIds }: ConditionEditorProps) {
  const { blob } = useDataset();
  const facts = blob?.facts ?? {};
  const constants = blob?.constants ?? {};
  const mode = getMode(condition);
  const isMulti = mode !== "single";

  function handleModeChange(newMode: ConditionMode) {
    if (newMode === mode) return;
    const subs = getSubs(condition, mode);

    if (newMode === "single") {
      onChange(subs[0] ?? { "": true });
    } else {
      const padded = subs.length < 2 ? [...subs, { "": true }] : subs;
      onChange(buildCondition(newMode, padded));
    }
  }

  function handleSubChange(index: number, updated: SimpleCondition) {
    const subs = getSubs(condition, mode);
    const next = [...subs];
    next[index] = updated;
    onChange(buildCondition(mode, next));
  }

  function handleSubRemove(index: number) {
    const subs = getSubs(condition, mode);
    onChange(
      buildCondition(
        mode,
        subs.filter((_, j) => j !== index)
      )
    );
  }

  function handleSubAdd() {
    const subs = getSubs(condition, mode);
    onChange(buildCondition(mode, [...subs, { "": true }]));
  }

  const subs = getSubs(condition, mode);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">when</span>
        <div className="flex">
          <Button
            variant={mode === "single" ? "default" : "outline"}
            size="xs"
            className="rounded-r-none"
            onClick={() => handleModeChange("single")}
          >
            <GateSingle className="size-4" />
            single condition is true
          </Button>
          <Button
            variant={mode === "or" ? "default" : "outline"}
            size="xs"
            className="rounded-none border-x-0"
            onClick={() => handleModeChange("or")}
          >
            <GateOr className="size-4" />
            any of these is true
          </Button>
          <Button
            variant={mode === "and" ? "default" : "outline"}
            size="xs"
            className="rounded-l-none"
            onClick={() => handleModeChange("and")}
          >
            <GateAnd className="size-4" />
            all of these are true
          </Button>
        </div>
      </div>

      {subs.map((sub, i) => (
        <SimpleConditionRow
          key={`${mode}-${Object.keys(sub)[0] || i}`}
          condition={sub}
          onChange={(updated) => handleSubChange(i, updated)}
          onRemove={isMulti && subs.length > 1 ? () => handleSubRemove(i) : undefined}
          factIds={factIds}
          facts={facts}
          constants={constants}
        />
      ))}

      {isMulti && (
        <Button variant="outline" size="sm" onClick={handleSubAdd}>
          <Plus className="size-3" /> Add condition
        </Button>
      )}
    </div>
  );
}
