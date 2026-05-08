"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  variant?: "outlined" | "segmented";
  disabled?: boolean;
  title?: string;
};

const VARIANTS = {
  outlined: {
    base: "h-7 rounded-md border px-2",
    active: "border-primary/40 bg-primary/10 text-foreground",
    idle: "border-border bg-background text-muted-foreground hover:text-foreground"
  },
  segmented: {
    base: "h-6 rounded-sm px-2",
    active: "bg-secondary text-secondary-foreground",
    idle: "text-muted-foreground hover:text-foreground"
  }
} as const;

export function IconToggle({ active, onClick, icon: Icon, label, variant = "outlined", disabled, title }: Props) {
  const styles = VARIANTS[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      title={title ?? label}
      className={cn(
        "inline-flex items-center gap-1 text-xs transition-colors",
        styles.base,
        active ? styles.active : styles.idle,
        disabled && "cursor-not-allowed opacity-50 hover:text-muted-foreground"
      )}
    >
      <Icon className="size-3" />
      {label}
    </button>
  );
}
