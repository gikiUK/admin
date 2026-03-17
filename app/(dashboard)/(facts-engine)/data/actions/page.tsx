"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActionCard } from "@/components/actions/action-card";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { loadActions } from "@/lib/blob/api-client";
import type { Action } from "@/lib/blob/types";
import { useDataset } from "@/lib/blob/use-dataset";

const ROW_GAP = 12;
const ESTIMATED_ROW_HEIGHT = 90;
const BOTTOM_PADDING = 24;

function filterActions(actions: Action[], search: string, status: string): Action[] {
  return actions.filter((a) => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (status === "enabled" && !a.enabled) return false;
    if (status === "disabled" && a.enabled) return false;
    return true;
  });
}

export default function ActionsPage() {
  const { blob } = useDataset();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollHeight, setScrollHeight] = useState(0);

  const scrollCallbackRef = useCallback((node: HTMLDivElement | null) => {
    scrollRef.current = node;
    if (node) {
      const top = node.getBoundingClientRect().top;
      setScrollHeight(window.innerHeight - top - BOTTOM_PADDING);
    }
  }, []);

  useEffect(() => {
    function onResize() {
      if (scrollRef.current) {
        const top = scrollRef.current.getBoundingClientRect().top;
        setScrollHeight(window.innerHeight - top - BOTTOM_PADDING);
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    loadActions()
      .then(setActions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterActions(actions, search, status);
  const conditions = blob?.action_conditions ?? {};
  const facts = blob?.facts ?? {};
  const constants = blob?.constants ?? {};

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 10,
    gap: ROW_GAP
  });

  // Scroll to hash anchor (e.g. #a-85) once actions load
  const didScrollToHash = useRef(false);
  useEffect(() => {
    if (loading || didScrollToHash.current || filtered.length === 0) return;
    const hash = window.location.hash; // e.g. "#a-85"
    if (!hash.startsWith("#a-")) return;
    const actionId = hash.slice(3); // "85"
    const index = filtered.findIndex((a) => String(a.id) === actionId);
    if (index >= 0) {
      didScrollToHash.current = true;
      virtualizer.scrollToIndex(index, { align: "center" });
    }
  }, [loading, filtered, virtualizer]);

  if (loading) return <p className="py-8 text-center text-muted-foreground">Loading actions...</p>;
  if (error) return <p className="py-8 text-center text-destructive">Failed to load actions: {error}</p>;

  return (
    <div className="space-y-6">
      <PageHeader title="Actions" description="Climate actions and their dataset conditions." />

      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="enabled">Enabled</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {actions.length} actions
      </p>

      <div ref={scrollCallbackRef} className="overflow-auto" style={{ height: scrollHeight || "calc(100vh - 280px)" }}>
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No actions found.</p>
        ) : (
          <div className="relative" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((row) => {
              const action = filtered[row.index];
              return (
                <div
                  key={action.id}
                  ref={virtualizer.measureElement}
                  data-index={row.index}
                  className="absolute left-0 top-0 w-full"
                  style={{ transform: `translateY(${row.start}px)` }}
                >
                  <ActionCard
                    action={action}
                    condition={conditions[String(action.id)]}
                    facts={facts}
                    constants={constants}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
