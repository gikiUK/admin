"use client";

import { ChevronRight, ChevronsDownUp, ChevronsUpDown, Home, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { JsonTree } from "@/components/raw/json-tree";
import { SearchResultsList } from "@/components/raw/search-results";
import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";
import type { Plan } from "@/lib/bcorp/types";
import { flattenSearch } from "@/lib/blob/flatten-search";

function resolveJsonPath(root: unknown, path: string[]): unknown {
  let current = root;
  for (const segment of path) {
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current)) current = current[Number(segment)];
    else if (typeof current === "object") current = (current as Record<string, unknown>)[segment];
    else return undefined;
  }
  return current;
}

function FocusBreadcrumb({ path, onNavigate }: { path: string[]; onNavigate: (path: string[]) => void }) {
  return (
    <div className="flex items-center gap-1 text-xs font-mono">
      <button
        type="button"
        onClick={() => onNavigate([])}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
      >
        <Home className="size-3" />
        <span>root</span>
      </button>
      {path.map((segment, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: stable path segments
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="size-2.5 text-muted-foreground" />
          <button
            type="button"
            onClick={() => onNavigate(path.slice(0, i + 1))}
            className="text-muted-foreground hover:text-foreground"
          >
            {segment}
          </button>
        </span>
      ))}
    </div>
  );
}

export function PlanJsonExplorer({ plan }: { plan: Plan }) {
  const [search, setSearch] = useState("");
  const [focusPath, setFocusPath] = useState<string[]>([]);
  const [collapseSignal, setCollapseSignal] = useState(0);
  const [expandSignal, setExpandSignal] = useState(0);

  const query = search.toLowerCase().trim();
  const deferredQuery = useDeferredValue(query);
  const searchResult = useMemo(() => flattenSearch(plan, deferredQuery), [plan, deferredQuery]);
  const isSearching = !!query;
  const isFocused = focusPath.length > 0;

  const focusedValue = useMemo(
    () => (isFocused ? resolveJsonPath(plan, focusPath) : plan),
    [plan, focusPath, isFocused]
  );

  function handleNavigate(path: string[]) {
    setFocusPath(path);
    setSearch("");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Command className="flex-1 rounded-md border">
          <CommandInput placeholder="Search keys and values..." value={search} onValueChange={setSearch} />
        </Command>
        {search ? (
          <>
            <span className="shrink-0 text-sm text-muted-foreground">
              {searchResult.total} {searchResult.total === 1 ? "match" : "matches"}
            </span>
            <Button variant="outline" onClick={() => setSearch("")}>
              <X className="size-4" />
              Clear
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setCollapseSignal((s) => s + 1)}>
              <ChevronsDownUp className="size-4" />
              Collapse all
            </Button>
            <Button variant="outline" onClick={() => setExpandSignal((s) => s + 1)}>
              <ChevronsUpDown className="size-4" />
              Expand all
            </Button>
          </>
        )}
      </div>

      {isFocused && !isSearching && <FocusBreadcrumb path={focusPath} onNavigate={handleNavigate} />}

      {isSearching ? (
        <div className="overflow-auto rounded-lg border bg-muted/50 p-4 font-mono text-xs leading-relaxed">
          <SearchResultsList result={searchResult} query={deferredQuery} onNavigate={handleNavigate} />
        </div>
      ) : (
        <JsonTree
          data={focusedValue}
          collapseAllSignal={collapseSignal}
          expandAllSignal={expandSignal}
          virtual={false}
        />
      )}
    </div>
  );
}
