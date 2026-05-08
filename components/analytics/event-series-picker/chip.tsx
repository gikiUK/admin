"use client";

import { X } from "lucide-react";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ChipProps = {
  active: boolean;
  color: string;
  label: string;
  removable?: boolean;
} & ComponentPropsWithoutRef<"button">;

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { active, color, label, removable, className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-xs font-medium transition-colors",
        active
          ? "border-transparent text-white shadow-sm"
          : "border-border bg-background text-foreground hover:bg-muted",
        className
      )}
      style={active ? { backgroundColor: color } : undefined}
      aria-pressed={active}
      {...props}
    >
      <span
        className={cn("size-2 shrink-0 rounded-full", active && "bg-white/80")}
        style={!active ? { backgroundColor: color } : undefined}
        aria-hidden
      />
      {label}
      {removable && active && <X className="size-3 opacity-80" />}
    </button>
  );
});
