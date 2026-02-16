"use client";

import { ChevronRight, ChevronsDownUp, ChevronsUpDown, Home, Search, X } from "lucide-react";
import { createContext, useCallback, useContext, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { SearchResultsList } from "@/components/raw/search-results";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { flattenSearch } from "@/lib/blob/flatten-search";
import { useDataset } from "@/lib/blob/use-dataset";

// ── Collapse context ─────────────────────────────────────

type CollapseSignal = { version: number; target: "collapse" | "expand" };

const CollapseContext = createContext<CollapseSignal>({ version: 0, target: "expand" });

// ── JSON value rendering with syntax highlighting ────────

function JsonString({ value }: { value: string }) {
  return <span className="text-green-700 dark:text-green-400">&quot;{value}&quot;</span>;
}

function JsonNumber({ value }: { value: number }) {
  return <span className="text-blue-700 dark:text-blue-400">{String(value)}</span>;
}

function JsonBool({ value }: { value: boolean }) {
  return <span className="text-amber-700 dark:text-amber-400">{value ? "true" : "false"}</span>;
}

function JsonNull() {
  return <span className="text-muted-foreground italic">null</span>;
}

function JsonKey({ name }: { name: string }) {
  return <span className="text-purple-700 dark:text-purple-400">&quot;{name}&quot;</span>;
}

// ── Collapsible nodes ────────────────────────────────────

function JsonValue({ value, indent }: { value: unknown; indent: number }) {
  if (value === null) return <JsonNull />;
  if (typeof value === "string") return <JsonString value={value} />;
  if (typeof value === "number") return <JsonNumber value={value} />;
  if (typeof value === "boolean") return <JsonBool value={value} />;
  if (Array.isArray(value)) return <JsonArray items={value} indent={indent} />;
  if (typeof value === "object") return <JsonObject data={value as Record<string, unknown>} indent={indent} />;
  return <span>{String(value)}</span>;
}

function useCollapsible(defaultOpen: boolean) {
  const signal = useContext(CollapseContext);
  const [open, setOpen] = useState(() => {
    if (signal.version > 0) return signal.target === "expand";
    return defaultOpen;
  });
  const handledRef = useRef(signal.version);

  useEffect(() => {
    if (signal.version === 0 || signal.version === handledRef.current) return;
    handledRef.current = signal.version;
    setOpen(signal.target === "expand");
  }, [signal]);

  return [open, setOpen] as const;
}

function JsonObject({ data, indent }: { data: Record<string, unknown>; indent: number }) {
  const entries = Object.entries(data);
  const [open, setOpen] = useCollapsible(indent < 2);

  if (entries.length === 0) return <span className="text-muted-foreground">{"{}"}</span>;

  const pad = "  ".repeat(indent + 1);
  const closePad = "  ".repeat(indent);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-0.5 text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className="inline size-3" />
        <span>{"{"}</span>
        <span className="text-xs italic"> {entries.length} keys </span>
        <span>{"}"}</span>
      </button>
    );
  }

  return (
    <span>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="inline-flex items-center gap-0.5 text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className="inline size-3 rotate-90 transition-transform" />
        <span>{"{"}</span>
      </button>
      {"\n"}
      {entries.map(([key, val], i) => (
        <span key={key}>
          {pad}
          <JsonKey name={key} />
          {": "}
          <JsonValue value={val} indent={indent + 1} />
          {i < entries.length - 1 ? "," : ""}
          {"\n"}
        </span>
      ))}
      {closePad}
      {"}"}
    </span>
  );
}

function JsonArray({ items, indent }: { items: unknown[]; indent: number }) {
  const [open, setOpen] = useCollapsible(indent < 2);

  if (items.length === 0) return <span className="text-muted-foreground">[]</span>;

  // Render small primitive arrays inline
  const allPrimitive = items.every((v) => v === null || typeof v !== "object");
  if (allPrimitive && items.length <= 5) {
    return (
      <span>
        [
        {items.map((item, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: read-only JSON viewer, stable order
          <span key={i}>
            <JsonValue value={item} indent={indent + 1} />
            {i < items.length - 1 ? ", " : ""}
          </span>
        ))}
        ]
      </span>
    );
  }

  const pad = "  ".repeat(indent + 1);
  const closePad = "  ".repeat(indent);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-0.5 text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className="inline size-3" />
        <span>[</span>
        <span className="text-xs italic"> {items.length} items </span>
        <span>]</span>
      </button>
    );
  }

  return (
    <span>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="inline-flex items-center gap-0.5 text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className="inline size-3 rotate-90 transition-transform" />
        <span>[</span>
      </button>
      {"\n"}
      {items.map((item, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: read-only JSON viewer, stable order
        <span key={i}>
          {pad}
          <JsonValue value={item} indent={indent + 1} />
          {i < items.length - 1 ? "," : ""}
          {"\n"}
        </span>
      ))}
      {closePad}]
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────

export default function RawPage() {
  const { blob, loading } = useDataset();
  const [signal, setSignal] = useState<CollapseSignal>({ version: 0, target: "expand" });
  const [search, setSearch] = useState("");

  const query = search.toLowerCase().trim();
  const deferredQuery = useDeferredValue(query);
  const searchResult = useMemo(() => (blob ? flattenSearch(blob, deferredQuery) : null), [blob, deferredQuery]);
  const isSearching = !!query;

  if (loading || !blob) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  return (
    <CollapseContext value={signal}>
      <div className="space-y-6">
        <PageHeader
          title="Raw JSON"
          description="Read-only view of the current dataset blob."
          action={
            !isSearching && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSignal({ version: signal.version + 1, target: "collapse" })}
                >
                  <ChevronsDownUp className="size-3" />
                  Collapse all
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSignal({ version: signal.version + 1, target: "expand" })}
                >
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

        {isSearching && searchResult ? (
          <div className="overflow-auto rounded-lg border bg-muted/50 p-4 font-mono text-xs leading-relaxed">
            <SearchResultsList result={searchResult} query={deferredQuery} />
          </div>
        ) : (
          <pre className="overflow-auto rounded-lg border bg-muted/50 p-4 font-mono text-xs leading-relaxed">
            <JsonValue value={blob} indent={0} />
          </pre>
        )}
      </div>
    </CollapseContext>
  );
}
