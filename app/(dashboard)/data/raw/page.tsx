"use client";

import { ChevronRight, ChevronsDownUp, ChevronsUpDown, Home, Search, X } from "lucide-react";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { JsonTree } from "@/components/raw/json-tree";
import { SearchResultsList } from "@/components/raw/search-results";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { flattenSearch } from "@/lib/blob/flatten-search";
import { useDataset } from "@/lib/blob/use-dataset";

// ── Path resolution ──────────────────────────────────────

function resolveJsonPath(root: unknown, path: string[]): unknown {
  let current = root;
  for (const segment of path) {
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current)) {
      current = current[Number(segment)];
    } else if (typeof current === "object") {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return current;
}

// ── Focus breadcrumb ─────────────────────────────────────

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

// ── Page ─────────────────────────────────────────────────

export default function RawPage() {
  const { blob, loading } = useDataset();
  const [search, setSearch] = useState("");
  const [focusPath, setFocusPath] = useState<string[]>([]);
  const [collapseSignal, setCollapseSignal] = useState(0);
  const [expandSignal, setExpandSignal] = useState(0);

  const query = search.toLowerCase().trim();
  const deferredQuery = useDeferredValue(query);
  const searchResult = useMemo(() => (blob ? flattenSearch(blob, deferredQuery) : null), [blob, deferredQuery]);
  const isSearching = !!query;
  const isFocused = focusPath.length > 0;

  const focusedValue = useMemo(
    () => (isFocused && blob ? resolveJsonPath(blob, focusPath) : blob),
    [blob, focusPath, isFocused]
  );

  const handleNavigate = useCallback((path: string[]) => {
    setFocusPath(path);
    setSearch("");
  }, []);

  if (loading || !blob) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raw JSON"
        description="Read-only view of the current dataset blob."
        action={
          !isSearching && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCollapseSignal((s) => s + 1)}>
                <ChevronsDownUp className="size-3" />
                Collapse all
              </Button>
              <Button variant="outline" size="sm" onClick={() => setExpandSignal((s) => s + 1)}>
                <ChevronsUpDown className="size-3" />
                Expand all
              </Button>
            </div>
          )
        }
      />

      <div className="relative">
        <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
        <Input
          placeholder="Search keys and values..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-20"
        />
        {search && (
          <div className="absolute top-1.5 right-2 flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              {searchResult ? searchResult.total : 0} {searchResult?.total === 1 ? "match" : "matches"}
            </span>
            <Button variant="ghost" size="icon-xs" onClick={() => setSearch("")}>
              <X className="size-3" />
            </Button>
          </div>
        )}
      </div>

      {isFocused && !isSearching && <FocusBreadcrumb path={focusPath} onNavigate={handleNavigate} />}

      {isSearching && searchResult ? (
        <div className="overflow-auto rounded-lg border bg-muted/50 p-4 font-mono text-xs leading-relaxed">
          <SearchResultsList result={searchResult} query={deferredQuery} onNavigate={handleNavigate} />
        </div>
      ) : (
        <JsonTree data={focusedValue} collapseAllSignal={collapseSignal} expandAllSignal={expandSignal} />
      )}
    </div>
  );
}
