"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CheckboxRadioOption } from "@/lib/data/types";

type OptionsListEditorProps = {
  options: CheckboxRadioOption[];
  onChange: (options: CheckboxRadioOption[]) => void;
};

export function OptionsListEditor({ options, onChange }: OptionsListEditorProps) {
  function handleAdd() {
    onChange([...options, { label: "", value: "" }]);
  }

  function handleUpdate(index: number, updates: Partial<CheckboxRadioOption>) {
    const next = [...options];
    next[index] = { ...next[index], ...updates };
    onChange(next);
  }

  function handleRemove(index: number) {
    onChange(options.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium">Options</Label>

      {options.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_120px_70px_32px] items-center gap-2 text-xs font-medium text-muted-foreground">
            <span>Label</span>
            <span>Value</span>
            <span>Exclusive</span>
            <span />
          </div>

          {options.map((opt, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: editable list with no stable ID
            <div key={i} className="grid grid-cols-[1fr_120px_70px_32px] items-center gap-2">
              <Input
                value={opt.label}
                onChange={(e) => handleUpdate(i, { label: e.target.value })}
                placeholder="Label"
                className="h-8 text-xs"
              />
              <Input
                value={opt.value}
                onChange={(e) => handleUpdate(i, { value: e.target.value })}
                placeholder="value"
                className="h-8 font-mono text-xs"
              />
              <div className="flex justify-center">
                <Checkbox
                  checked={opt.exclusive ?? false}
                  onCheckedChange={(checked) => handleUpdate(i, { exclusive: checked === true ? true : undefined })}
                />
              </div>
              <Button variant="ghost" size="icon-xs" onClick={() => handleRemove(i)}>
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button variant="outline" size="sm" onClick={handleAdd}>
        <Plus className="size-3" /> Add option
      </Button>
    </div>
  );
}
