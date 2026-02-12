"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type GroupModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, valueType: "string" | "label-value") => void;
};

export function GroupModal({ open, onOpenChange, onSave }: GroupModalProps) {
  const [name, setName] = useState("");
  const [valueType, setValueType] = useState<"string" | "label-value">("string");

  useEffect(() => {
    if (open) {
      setName("");
      setValueType("string");
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim().toUpperCase().replace(/\s+/g, "_");
    if (!trimmed) return;
    onSave(trimmed, valueType);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="group-name" className="text-sm font-medium">
              Group Name
            </label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MY_NEW_OPTIONS"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">Will be converted to UPPER_SNAKE_CASE automatically.</p>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Value Type</span>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="valueType"
                  checked={valueType === "string"}
                  onChange={() => setValueType("string")}
                  className="accent-primary"
                />
                Simple text
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="valueType"
                  checked={valueType === "label-value"}
                  onChange={() => setValueType("label-value")}
                  className="accent-primary"
                />
                Label + Value
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
