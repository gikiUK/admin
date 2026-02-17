"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
          {!disabled && (
            <>
              <span className="text-xs text-muted-foreground">Sets to:</span>
              <Select
                value={String(rule.value)}
                onValueChange={(v) => {
                  const value = v === "true" ? true : v === "false" ? false : v;
                  onChange(globalIndex, { ...rule, value });
                }}
              >
                <SelectTrigger className="h-7 w-[160px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">true</SelectItem>
                  <SelectItem value="false">false</SelectItem>
                  <SelectItem value="not_applicable">not_applicable</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
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
        <ConditionEditor
          condition={rule.when}
          onChange={(when) => onChange(globalIndex, { ...rule, when })}
          factIds={factIds}
        />
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
