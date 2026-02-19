"use client";

import { Flag } from "lucide-react";
import type { ChangeEntry } from "@/lib/blob/change-log";
import { formatRelativeTime } from "./format-relative-time";

export function LifecycleMarker({ entry }: { entry: ChangeEntry }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5">
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
        <Flag className="size-3 text-muted-foreground" />
      </div>
      <span className="text-muted-foreground text-xs font-medium">{entry.description}</span>
      <span className="text-muted-foreground/60 ml-auto text-[10px]">{formatRelativeTime(entry.timestamp)}</span>
    </div>
  );
}
