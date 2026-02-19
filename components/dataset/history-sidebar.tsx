"use client";

import { PanelRightClose, Redo2, Trash2, Undo2 } from "lucide-react";
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
      {/* Gap — takes up space in the flex row so SidebarInset shrinks */}
      <div
        className="relative w-0 bg-transparent transition-[width] duration-200 ease-linear data-[state=expanded]:w-[24rem]"
        data-state={open ? "expanded" : "collapsed"}
      />

      {/* Fixed panel */}
      <aside
        className="bg-sidebar text-sidebar-foreground fixed inset-y-0 right-0 z-10 hidden h-svh w-[24rem] flex-col border-l transition-[right] duration-200 ease-linear md:flex data-[state=collapsed]:right-[calc(24rem*-1)]"
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
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => {
                clearHistory();
                setOpen(false);
              }}
            >
              <Trash2 className="size-3.5" />
              Clear history
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}
