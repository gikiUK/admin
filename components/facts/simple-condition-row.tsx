"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ConstantsLookup, FactsLookup } from "@/lib/blob/resolve";
import { resolveConstantId } from "@/lib/blob/resolve";
import type { SimpleCondition } from "@/lib/blob/types";
import { defaultValueForType, getOperatorsForType } from "./condition-helpers";
import { ConstantPicker } from "./constant-picker";
import { TagInput } from "./tag-input";

export function SimpleConditionRow({
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
