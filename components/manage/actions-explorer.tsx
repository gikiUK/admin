"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { ActionsTable } from "@/components/manage/actions-table";
import { DebouncedInput } from "@/components/ui/debounced-input";
import type { ManagedAction } from "@/lib/manage/actions-api";
import { actionsQuery } from "@/lib/manage/queries";
import { useUrlState } from "@/lib/use-url-state";

function matchesQuery(action: ManagedAction, query: string): boolean {
  const needle = query.toLowerCase();
  return action.title.toLowerCase().includes(needle) || (action.airtable_id?.toLowerCase().includes(needle) ?? false);
}

export function ActionsExplorer() {
  const { searchParams, set } = useUrlState();
  const query = searchParams.get("q") ?? "";

  const result = useQuery(actionsQuery());
  const actions = result.data?.actions ?? [];
  const errorMessage = result.isError
    ? result.error instanceof Error
      ? result.error.message
      : "Failed to load actions"
    : "";

  const filtered = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return actions;
    return actions.filter((action) => matchesQuery(action, trimmed));
  }, [actions, query]);

  const handleQueryChange = useCallback(
    (value: string) => {
      set({ q: value || undefined });
    },
    [set]
  );

  return (
    <div className="space-y-4">
      <div className="flex max-w-md">
        <DebouncedInput
          value={query}
          onCommit={handleQueryChange}
          placeholder="Search by title or Airtable Record ID…"
          aria-label="Search actions"
        />
      </div>
      {errorMessage && <div className="text-sm text-destructive">{errorMessage}</div>}
      {result.isPending ? (
        <div className="text-sm text-muted-foreground">Loading actions…</div>
      ) : (
        <>
          <ActionsTable actions={filtered} />
          <div className="text-xs text-muted-foreground">
            {filtered.length} of {actions.length} actions
          </div>
        </>
      )}
    </div>
  );
}
