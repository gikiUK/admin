"use client";

import { X } from "lucide-react";
import { useState } from "react";
import type { ConstantValue } from "@/lib/data/types";
import { cn } from "@/lib/utils";

type ValuePillProps = {
  value: ConstantValue;
  onEdit: () => void;
  onDelete: () => void;
};

export function ValuePill({ value, onEdit, onDelete }: ValuePillProps) {
  const [confirming, setConfirming] = useState(false);
  const label = typeof value === "string" ? value : value.label;

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-sm">
        <span className="text-destructive">Delete?</span>
        <button
          type="button"
          className="font-medium text-destructive hover:underline"
          onClick={() => {
            onDelete();
            setConfirming(false);
          }}
        >
          Yes
        </button>
        <span className="text-muted-foreground">/</span>
        <button
          type="button"
          className="font-medium text-muted-foreground hover:underline"
          onClick={() => setConfirming(false)}
        >
          No
        </button>
      </span>
    );
  }

  return (
    <span className="group inline-flex items-center rounded-full border bg-secondary text-sm transition-colors">
      <button
        type="button"
        className={cn(
          "cursor-pointer rounded-l-full py-1 pl-3 pr-2 hover:bg-accent",
          typeof value !== "string" && "border-r border-dashed border-border"
        )}
        onClick={onEdit}
        title={typeof value !== "string" ? `${value.label} → ${value.value}` : undefined}
      >
        {label}
      </button>
      <button
        type="button"
        className="cursor-pointer rounded-r-full py-1 pr-2 pl-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
        onClick={() => setConfirming(true)}
        aria-label={`Delete ${label}`}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
