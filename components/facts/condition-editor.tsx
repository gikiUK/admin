"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BlobCondition, SimpleCondition } from "@/lib/blob/types";
import { useDataset } from "@/lib/blob/use-dataset";
import { buildCondition, type ConditionMode, getMode, getSubs } from "./condition-helpers";
import { GateAnd, GateOr, GateSingle } from "./logic-gate-icons";
import { SimpleConditionRow } from "./simple-condition-row";

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
  const subs = getSubs(condition, mode);

  function handleModeChange(newMode: ConditionMode) {
    if (newMode === mode) return;
    const current = getSubs(condition, mode);

    if (newMode === "single") {
      onChange(current[0] ?? { "": true });
    } else {
      const padded = current.length < 2 ? [...current, { "": true }] : current;
      onChange(buildCondition(newMode, padded));
    }
  }

  function handleSubChange(index: number, updated: SimpleCondition) {
    const next = [...subs];
    next[index] = updated;
    onChange(buildCondition(mode, next));
  }

  function handleSubRemove(index: number) {
    onChange(
      buildCondition(
        mode,
        subs.filter((_, j) => j !== index)
      )
    );
  }

  function handleSubAdd() {
    onChange(buildCondition(mode, [...subs, { "": true }]));
  }

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
