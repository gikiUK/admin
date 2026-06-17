"use client";

import { MessageSquareText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { RejectionDetails, RejectionReason } from "@/lib/analytics/api";
import { cn } from "@/lib/utils";

const REASON_LABEL: Record<RejectionReason, string> = {
  cost: "Cost",
  time: "Time",
  irrelevant: "Irrelevant",
  other: "Other"
};

const REASON_STYLE: Record<RejectionReason, string> = {
  cost: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  time: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  irrelevant: "border-muted-foreground/30 bg-muted text-muted-foreground",
  other: "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400"
};

export function RejectionReasonCell({ rejection }: { rejection: RejectionDetails | null }) {
  if (!rejection) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const { reason, details } = rejection;

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={cn("text-xs", REASON_STYLE[reason])}>
        {REASON_LABEL[reason]}
      </Badge>
      {details && (
        <Popover>
          <PopoverTrigger
            aria-label="Show rejection details"
            className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <MessageSquareText className="size-3.5" />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80">
            <div className="text-xs font-medium text-muted-foreground">Details</div>
            <p className="mt-1 whitespace-pre-wrap text-sm">{details}</p>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
