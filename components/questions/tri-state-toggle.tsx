"use client";

import { Check, CircleHelp, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { normalizeTriState, type TriState } from "./facts-mapping-types";

type TriStateToggleProps = {
  value: string | boolean;
  onChange: (value: TriState) => void;
};

const SEGMENTS = [
  { state: true, icon: Check, label: "True", activeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  { state: false, icon: X, label: "False", activeClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
  {
    state: "unknown",
    icon: CircleHelp,
    label: "Unknown",
    activeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400"
  }
] as const;

export function TriStateToggle({ value, onChange }: TriStateToggleProps) {
  const current = normalizeTriState(value);

  return (
    <TooltipProvider>
      <div className="inline-flex overflow-hidden rounded-md border">
        {SEGMENTS.map(({ state, icon: Icon, label, activeClass }) => {
          const isActive = current === state;
          return (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={label}
                  aria-pressed={isActive}
                  onClick={() => onChange(state)}
                  className={cn(
                    "flex h-6 w-7 items-center justify-center transition-colors",
                    isActive ? activeClass : "text-muted-foreground/40 hover:bg-muted hover:text-muted-foreground"
                  )}
                >
                  <Icon className="size-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
