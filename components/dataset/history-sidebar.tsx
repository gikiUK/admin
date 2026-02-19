"use client";

import { PanelRightClose, Redo2, Trash2, Undo2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDataset } from "@/lib/blob/use-dataset";
import { useHistorySidebar } from "@/lib/history-sidebar-context";
import { HistoryEntry } from "./history/history-entry";
import { LifecycleMarker } from "./history/lifecycle-marker";

export function HistorySidebar() {
  const { open, setOpen } = useHistorySidebar();
  const { history, travelTo, undo, redo, canUndo, canRedo, clearHistory, blob } = useDataset();
  const currentQuestions = blob?.questions ?? [];
  const { entries, cursor } = history;

  return (
    <div data-state={open ? "expanded" : "collapsed"}>
      {/* Backdrop — mobile only, closes panel on tap */}
      {open && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss doesn't need keyboard handling
        <div className="fixed inset-0 z-10 bg-black/50 md:hidden" role="none" onClick={() => setOpen(false)} />
      )}

      {/* Gap — takes up space in the flex row so SidebarInset shrinks (desktop only) */}
      <div
        className="relative hidden w-0 bg-transparent transition-[width] duration-200 ease-linear data-[state=expanded]:w-[24rem] md:block"
        data-state={open ? "expanded" : "collapsed"}
      />

      {/* Fixed panel — overlay on mobile, push on desktop */}
      <aside
        className="bg-sidebar text-sidebar-foreground fixed inset-y-0 right-0 z-20 flex h-svh w-[min(24rem,100vw)] flex-col border-l transition-[right] duration-200 ease-linear data-[state=collapsed]:right-[calc(min(24rem,100vw)*-1)]"
        data-state={open ? "expanded" : "collapsed"}
      >
        {/* Header */}
        <div className="flex h-12 items-center gap-2 border-b px-4">
          <span className="text-sm font-semibold">History</span>
          <span className="text-muted-foreground text-xs">
            {entries.length} {entries.length === 1 ? "change" : "changes"}
          </span>
          <div className="ml-auto flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="size-7" onClick={undo} disabled={!canUndo}>
              <Undo2 className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="size-7" onClick={redo} disabled={!canRedo}>
              <Redo2 className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => setOpen(false)}>
              <PanelRightClose className="size-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {entries.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">No history yet.</p>
          ) : (
            <div className="space-y-1">
              {[...entries].reverse().map((entry, reversedIdx) => {
                const realIndex = entries.length - 1 - reversedIdx;
                if (entry.isLifecycle) {
                  return <LifecycleMarker key={entry.id} entry={entry} />;
                }
                return (
                  <HistoryEntry
                    key={entry.id}
                    entry={entry}
                    index={realIndex}
                    isCurrent={realIndex === cursor}
                    isUndone={realIndex > cursor}
                    onTravel={travelTo}
                    currentQuestions={currentQuestions}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {entries.length > 0 && (
          <div className="border-t px-4 py-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-3.5" />
                  Clear history
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove all {entries.length} {entries.length === 1 ? "entry" : "entries"} from
                    your undo history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => {
                      clearHistory();
                      setOpen(false);
                    }}
                  >
                    Clear
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </aside>
    </div>
  );
}
