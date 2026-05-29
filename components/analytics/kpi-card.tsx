"use client";

import { Info, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type KpiCardProps = {
  label: string;
  value: string | number | null;
  hint?: string;
  icon?: LucideIcon;
};

export function KpiCard({ label, value, hint, icon: Icon }: KpiCardProps) {
  return (
    <Card className="gap-1 px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          {hint && <KpiHint hint={hint} />}
        </div>
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
      </div>
      <div className="text-lg font-semibold tracking-tight leading-tight">{value ?? "—"}</div>
    </Card>
  );
}

function KpiHint({ hint }: { hint: string }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="What does this metric mean?"
            className="inline-flex size-3 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <Info className="size-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" align="start" className="max-w-64">
          {hint}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
