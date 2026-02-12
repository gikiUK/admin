"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ConstantValue } from "@/lib/data/types";

type ValueModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLabelValue: boolean;
  initialValue?: ConstantValue;
  onSave: (value: ConstantValue) => void;
};

export function ValueModal({ open, onOpenChange, isLabelValue, initialValue, onSave }: ValueModalProps) {
  const [text, setText] = useState("");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const isEditing = initialValue !== undefined;

  useEffect(() => {
    if (open) {
      if (initialValue && typeof initialValue === "string") {
        setText(initialValue);
      } else if (initialValue && typeof initialValue === "object") {
        setLabel(initialValue.label);
        setValue(initialValue.value);
      } else {
        setText("");
        setLabel("");
        setValue("");
      }
    }
  }, [open, initialValue]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLabelValue) {
      if (!label.trim() || !value.trim()) return;
      onSave({ label: label.trim(), value: value.trim() });
    } else {
      if (!text.trim()) return;
      onSave(text.trim());
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Value" : "Add Value"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isLabelValue ? (
            <>
              <div className="space-y-2">
                <label htmlFor="value-label" className="text-sm font-medium">
                  Label
                </label>
                <Input id="value-label" value={label} onChange={(e) => setLabel(e.target.value)} autoFocus />
              </div>
              <div className="space-y-2">
                <label htmlFor="value-value" className="text-sm font-medium">
                  Value
                </label>
                <Input id="value-value" value={value} onChange={(e) => setValue(e.target.value)} />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label htmlFor="value-text" className="text-sm font-medium">
                Value
              </label>
              <Input id="value-text" value={text} onChange={(e) => setText(e.target.value)} autoFocus />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
