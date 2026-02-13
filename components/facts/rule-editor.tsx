"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Rule } from "@/lib/data/types";
import { ConditionEditor } from "./condition-editor";

type RuleEditorProps = {
  rules: Rule[];
  factId: string;
  factIds: string[];
  onChange: (rules: Rule[]) => void;
};

function SingleRuleEditor({
  rule,
  index,
  factIds,
  onChange,
  onRemove
}: {
  rule: Rule;
  index: number;
  factIds: string[];
  onChange: (rule: Rule) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Rule {index + 1}</span>
          <span className="text-xs text-muted-foreground">Sets to:</span>
          <Select
            value={String(rule.value)}
            onValueChange={(v) => {
              const value = v === "true" ? true : v === "false" ? false : v;
              onChange({ ...rule, value });
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
        </div>
        <Button variant="ghost" size="icon-xs" onClick={onRemove}>
          <Trash2 className="size-3" />
        </Button>
      </div>

      <ConditionEditor condition={rule.when} onChange={(when) => onChange({ ...rule, when })} factIds={factIds} />
    </div>
  );
}

export function RuleEditor({ rules, factId, factIds, onChange }: RuleEditorProps) {
  const availableFactIds = factIds.filter((id) => id !== factId);

  function handleAddRule() {
    const newRule: Rule = {
      sets: factId,
      value: false,
      when: { "": true }
    };
    onChange([...rules, newRule]);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Rules</h3>
        <Button variant="outline" size="sm" onClick={handleAddRule}>
          <Plus className="size-3" /> Add Rule
        </Button>
      </div>

      {rules.length === 0 && <p className="text-sm text-muted-foreground">No rules defined for this fact.</p>}

      {rules.map((rule, i) => (
        <SingleRuleEditor
          key={`rule-${rule.sets}-${String(rule.value)}-${i}`}
          rule={rule}
          index={i}
          factIds={availableFactIds}
          onChange={(updated) => {
            const next = [...rules];
            next[i] = updated;
            onChange(next);
          }}
          onRemove={() => onChange(rules.filter((_, j) => j !== i))}
        />
      ))}
    </div>
  );
}
