"use client";

import { Undo2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { FieldChange } from "@/lib/blob/change-log";
import { useDataset } from "@/lib/blob/use-dataset";
import { DiffView } from "./diff-view";

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function ChangesPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { changeLog, undoChange, undoAll } = useDataset();
  const [diffOpen, setDiffOpen] = useState(false);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Changes ({changeLog.length})</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4">
            {changeLog.length === 0 ? (
              <p className="text-muted-foreground text-sm">No changes yet.</p>
            ) : (
              <ul className="space-y-2">
                {[...changeLog].reverse().map((entry) => (
                  <li key={entry.id} className="flex items-start justify-between gap-2 rounded-md border p-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <p className="text-sm font-medium leading-tight">{entry.description}</p>
                        <p className="text-muted-foreground shrink-0 text-xs">{formatRelativeTime(entry.timestamp)}</p>
                      </div>
                      {entry.details.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {entry.details.map((d: FieldChange) => (
                            <li key={d.field} className="text-muted-foreground text-xs">
                              <span className="font-medium">{d.field}</span>:{" "}
                              <span className="text-red-600 line-through dark:text-red-400">{d.from}</span>
                              {" → "}
                              <span className="text-green-600 dark:text-green-400">{d.to}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => undoChange(entry.id)}
                      title="Undo this change"
                    >
                      <Undo2 className="size-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {changeLog.length > 0 && (
            <SheetFooter>
              <Button variant="outline" size="sm" onClick={() => undoAll()}>
                Undo All
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDiffOpen(true)}>
                View Diff
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <DiffView open={diffOpen} onOpenChange={setDiffOpen} />
    </>
  );
}
