"use client";

import { Plus, X } from "lucide-react";
import { ConditionEditor } from "@/components/facts/condition-editor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Condition } from "@/lib/data/types";

type QuestionConditionsSectionProps = {
  showWhen: Condition | undefined;
  hideWhen: Condition | undefined;
  unknowable: boolean;
  factIds: string[];
  onShowWhenChange: (c: Condition | undefined) => void;
  onHideWhenChange: (c: Condition | undefined) => void;
  onUnknowableChange: (v: boolean) => void;
};

export function QuestionConditionsSection({
  showWhen,
  hideWhen,
  unknowable,
  factIds,
  onShowWhenChange,
  onHideWhenChange,
  onUnknowableChange
}: QuestionConditionsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Show when</Label>
          {showWhen ? (
            <Button variant="ghost" size="icon-xs" onClick={() => onShowWhenChange(undefined)}>
              <X className="size-3" />
            </Button>
          ) : (
            <Button variant="outline" size="xs" onClick={() => onShowWhenChange({ "": true })}>
              <Plus className="size-3" /> Add
            </Button>
          )}
        </div>
        {showWhen && <ConditionEditor condition={showWhen} onChange={onShowWhenChange} factIds={factIds} />}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Hide when</Label>
          {hideWhen ? (
            <Button variant="ghost" size="icon-xs" onClick={() => onHideWhenChange(undefined)}>
              <X className="size-3" />
            </Button>
          ) : (
            <Button variant="outline" size="xs" onClick={() => onHideWhenChange({ "": true })}>
              <Plus className="size-3" /> Add
            </Button>
          )}
        </div>
        {hideWhen && <ConditionEditor condition={hideWhen} onChange={onHideWhenChange} factIds={factIds} />}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="unknowable"
          checked={unknowable}
          onCheckedChange={(checked) => onUnknowableChange(checked === true)}
        />
        <Label htmlFor="unknowable" className="font-normal">
          Unknowable
        </Label>
      </div>
    </div>
  );
}
