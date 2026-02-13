"use client";

import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AnyCondition, Condition, SimpleCondition } from "@/lib/data/types";

type ConditionEditorProps = {
  condition: Condition;
  onChange: (condition: Condition) => void;
  factIds: string[];
};

function isAnyCondition(c: Condition): c is AnyCondition {
  return "any" in c;
}

function SimpleConditionRow({
  condition,
  onChange,
  onRemove,
  factIds
}: {
  condition: SimpleCondition;
  onChange: (c: SimpleCondition) => void;
  onRemove?: () => void;
  factIds: string[];
}) {
  const entries = Object.entries(condition);
  const [factName, factValue] = entries[0] ?? ["", ""];
  const isArray = Array.isArray(factValue);

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

  function handleAddTag(tag: string) {
    if (!isArray) return;
    if ((factValue as string[]).includes(tag)) return;
    onChange({ [factName]: [...(factValue as string[]), tag] });
  }

  function handleRemoveTag(tag: string) {
    if (!isArray) return;
    onChange({ [factName]: (factValue as string[]).filter((t) => t !== tag) });
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
            {(factValue as string[]).map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-destructive">
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
          <TagInput onAdd={handleAddTag} />
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
      />
    </div>
  );
}
