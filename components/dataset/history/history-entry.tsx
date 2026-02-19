"use client";

import { Clock, ExternalLink, Flag, Undo2 } from "lucide-react";
import Link from "next/link";
import type { ChangeEntry } from "@/lib/blob/change-log";
import type { BlobQuestion } from "@/lib/blob/types";
import { actionHref } from "./action-href";
import { formatRelativeTime } from "./format-relative-time";
import { InlineDiff } from "./inline-diff";

function TimelineDot({ entry, isCurrent }: { entry: ChangeEntry; isCurrent: boolean }) {
  let bg = "bg-border";
  if (isCurrent) bg = "bg-primary text-primary-foreground";
  else if (entry.isRevert) bg = "bg-blue-100 dark:bg-blue-900";
  else if (entry.isDiscard) bg = "bg-orange-100 dark:bg-orange-900";

  let icon = <Clock className={`size-3 ${isCurrent ? "" : "text-muted-foreground"}`} />;
  if (!isCurrent && entry.isDiscard) icon = <Flag className="size-3 text-orange-600 dark:text-orange-400" />;
  else if (!isCurrent && entry.isRevert) icon = <Undo2 className="size-3 text-blue-600 dark:text-blue-400" />;

  return (
    <div className="flex flex-col items-center">
      <div className={`flex size-6 shrink-0 items-center justify-center rounded-full ${bg}`}>{icon}</div>
    </div>
  );
}

export function HistoryEntry({
  entry,
  index,
  isCurrent,
  isUndone,
  onTravel,
  currentQuestions
}: {
  entry: ChangeEntry;
  index: number;
  isCurrent: boolean;
  isUndone: boolean;
  onTravel: (index: number) => void;
  currentQuestions: BlobQuestion[];
}) {
  const href = actionHref(entry, currentQuestions);

  return (
    <button
      type="button"
      className={`relative flex w-full cursor-pointer gap-3 rounded-md border px-2 py-2 text-left transition-colors ${
        isUndone ? "border-dashed border-muted-foreground/40 opacity-60 hover:opacity-80" : "border-transparent"
      } ${isCurrent ? "bg-primary/5 ring-primary/30 ring-1" : "hover:bg-muted/50"}`}
      onClick={() => onTravel(index)}
    >
      <TimelineDot entry={entry} isCurrent={isCurrent} />

      <div className="-mt-0.5 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="min-w-0 text-sm font-medium leading-tight">{entry.description}</p>
          {isCurrent && (
            <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              HEAD
            </span>
          )}
          {href && (
            <Link
              href={href}
              className="ml-auto shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="size-3" />
            </Link>
          )}
        </div>
        <p className="text-muted-foreground text-xs">{formatRelativeTime(entry.timestamp)}</p>
        <InlineDiff details={entry.details} />
      </div>
    </button>
  );
}
