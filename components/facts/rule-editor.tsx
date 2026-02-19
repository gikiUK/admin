"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BlobRule } from "@/lib/blob/types";
import { cn } from "@/lib/utils";
import { ConditionEditor } from "./condition-editor";

type IndexedRule = { rule: BlobRule; index: number };

type RuleEditorProps = {
  rules: IndexedRule[];
  factId: string;
  factIds: string[];
  onChange: (globalIndex: number, rule: BlobRule) => void;
  onAdd: () => void;
  onDiscard: (globalIndex: number) => void;
  onRestore: (globalIndex: number) => void;
};

const VALUE_OPTIONS = [
  { value: "true", label: "true" },
  { value: "false", label: "false" },
  { value: "not_applicable", label: "not_applicable" }
] as const;

function SingleRuleEditor({
  entry,
  position,
  factIds,
  onChange,
  onDiscard,
  onRestore
}: {
  entry: IndexedRule;
  position: number;
  factIds: string[];
  onChange: (globalIndex: number, rule: BlobRule) => void;
  onDiscard: (globalIndex: number) => void;
  onRestore: (globalIndex: number) => void;
}) {
  const { rule, index: globalIndex } = entry;
  const disabled = rule.enabled === false;

  function handleValueChange(v: string) {
    const value = v === "true" ? true : v === "false" ? false : v;
    onChange(globalIndex, { ...rule, value });
  }

  return (
    <div className={cn("space-y-3 rounded-md border p-4", disabled && "opacity-50")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium", disabled && "line-through text-muted-foreground")}>
            Rule {position + 1}
          </span>
          <Badge variant={rule.source === "hotspot" ? "default" : "secondary"} className="text-xs">
            {rule.source}
          </Badge>
        </div>
        {disabled ? (
          <Button variant="outline" size="sm" onClick={() => onRestore(globalIndex)}>
            <RotateCcw className="size-3" /> Restore
          </Button>
        ) : (
          <Button variant="ghost" size="icon-xs" onClick={() => onDiscard(globalIndex)}>
            <Trash2 className="size-3" />
          </Button>
        )}
      </div>

      {!disabled && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Set this fact</span>
            <div className="flex gap-1">
              {VALUE_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={String(rule.value) === opt.value ? "default" : "outline"}
                  size="xs"
                  onClick={() => handleValueChange(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <ConditionEditor
            condition={rule.when}
            onChange={(when) => onChange(globalIndex, { ...rule, when })}
            factIds={factIds}
          />
        </>
      )}
    </div>
  );
}

export function RuleEditor({ rules, factId, factIds, onChange, onAdd, onDiscard, onRestore }: RuleEditorProps) {
  const availableFactIds = factIds.filter((id) => id !== factId);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Rules</h3>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="size-3" /> Add Rule
        </Button>
      </div>

      {rules.length === 0 && <p className="text-sm text-muted-foreground">No rules defined for this fact.</p>}

      {rules.map((entry, i) => (
        <SingleRuleEditor
          key={`rule-${entry.index}`}
          entry={entry}
          position={i}
          factIds={availableFactIds}
          onChange={onChange}
          onDiscard={onDiscard}
          onRestore={onRestore}
        />
      ))}
    </div>
  );
}
