"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronRight } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

// ── Line model ───────────────────────────────────────────

type LineType = "open-object" | "open-array" | "close" | "value" | "inline-array";

type JsonLine = {
  /** Unique key for this node in the tree (path-based) */
  id: string;
  indent: number;
  type: LineType;
  /** Object key name, if this line is inside an object */
  key?: string;
  /** Trailing comma? */
  comma: boolean;
} & (
  | { type: "open-object"; childCount: number }
  | { type: "open-array"; childCount: number }
  | { type: "close"; bracket: "}" | "]" }
  | { type: "value"; value: unknown }
  | { type: "inline-array"; items: unknown[] }
);

// ── Flatten JSON into visible lines ──────────────────────

function flattenJson(root: unknown, expanded: Set<string>): JsonLine[] {
  const lines: JsonLine[] = [];

  function walk(value: unknown, indent: number, id: string, key?: string, comma = false): void {
    if (value === null || typeof value !== "object") {
      lines.push({ id, indent, type: "value", key, comma, value });
      return;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push({ id, indent, type: "value", key, comma, value: "[]" } as JsonLine);
        return;
      }

      // Small primitive arrays render inline
      const allPrimitive = value.every((v) => v === null || typeof v !== "object");
      if (allPrimitive && value.length <= 5) {
        lines.push({ id, indent, type: "inline-array", key, comma, items: value } as JsonLine);
        return;
      }

      const isOpen = expanded.has(id);
      lines.push({ id, indent, type: "open-array", key, comma, childCount: value.length } as JsonLine);
      if (isOpen) {
        for (let i = 0; i < value.length; i++) {
          walk(value[i], indent + 1, `${id}.${i}`, undefined, i < value.length - 1);
        }
        lines.push({ id: `${id}.__close`, indent, type: "close", bracket: "]", comma } as JsonLine);
      }
      return;
    }

    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      lines.push({ id, indent, type: "value", key, comma, value: "{}" } as JsonLine);
      return;
    }

    const isOpen = expanded.has(id);
    lines.push({ id, indent, type: "open-object", key, comma, childCount: entries.length } as JsonLine);
    if (isOpen) {
      for (let i = 0; i < entries.length; i++) {
        const [k, v] = entries[i];
        walk(v, indent + 1, `${id}.${k}`, k, i < entries.length - 1);
      }
      lines.push({ id: `${id}.__close`, indent, type: "close", bracket: "}", comma } as JsonLine);
    }
  }

  walk(root, 0, "$");
  return lines;
}

// ── Collect all expandable node IDs ──────────────────────

function collectExpandableIds(root: unknown, prefix = "$"): string[] {
  const ids: string[] = [];

  function walk(value: unknown, id: string): void {
    if (value === null || typeof value !== "object") return;

    if (Array.isArray(value)) {
      if (value.length === 0) return;
      const allPrimitive = value.every((v) => v === null || typeof v !== "object");
      if (allPrimitive && value.length <= 5) return;
      ids.push(id);
      for (let i = 0; i < value.length; i++) {
        walk(value[i], `${id}.${i}`);
      }
      return;
    }

    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return;
    ids.push(id);
    for (const [k, v] of entries) {
      walk(v, `${id}.${k}`);
    }
  }

  walk(root, prefix);
  return ids;
}

function defaultExpanded(root: unknown): Set<string> {
  const ids = new Set<string>();

  function walk(value: unknown, id: string, depth: number): void {
    if (depth >= 2) return;
    if (value === null || typeof value !== "object") return;

    if (Array.isArray(value)) {
      if (value.length === 0) return;
      const allPrimitive = value.every((v) => v === null || typeof v !== "object");
      if (allPrimitive && value.length <= 5) return;
      ids.add(id);
      for (let i = 0; i < value.length; i++) {
        walk(value[i], `${id}.${i}`, depth + 1);
      }
      return;
    }

    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return;
    ids.add(id);
    for (const [k, v] of entries) {
      walk(v, `${id}.${k}`, depth + 1);
    }
  }

  walk(root, "$", 0);
  return ids;
}

// ── Inline value rendering ───────────────────────────────

function InlineValue({ value }: { value: unknown }) {
  if (value === null) return <span className="text-muted-foreground italic">null</span>;
  if (typeof value === "string") {
    return <span className="text-green-700 dark:text-green-400">&quot;{value}&quot;</span>;
  }
  if (typeof value === "number") {
    return <span className="text-blue-700 dark:text-blue-400">{String(value)}</span>;
  }
  if (typeof value === "boolean") {
    return <span className="text-amber-700 dark:text-amber-400">{value ? "true" : "false"}</span>;
  }
  if (value === "[]") return <span className="text-muted-foreground">[]</span>;
  if (value === "{}") return <span className="text-muted-foreground">{"{}"}</span>;
  return <span>{String(value)}</span>;
}

// ── Row renderer ─────────────────────────────────────────

const ROW_HEIGHT = 20;

function JsonRow({ line }: { line: JsonLine }) {
  const pad = "  ".repeat(line.indent);

  const keyPrefix = line.key ? (
    <>
      <span className="text-purple-700 dark:text-purple-400">&quot;{line.key}&quot;</span>
      {": "}
    </>
  ) : null;

  if (line.type === "value") {
    return (
      <div className="whitespace-pre" style={{ height: ROW_HEIGHT }}>
        {pad}
        {keyPrefix}
        <InlineValue value={line.value} />
        {line.comma ? "," : ""}
      </div>
    );
  }

  if (line.type === "inline-array") {
    return (
      <div className="whitespace-pre" style={{ height: ROW_HEIGHT }}>
        {pad}
        {keyPrefix}[
        {line.items.map((item, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: stable inline array
          <span key={i}>
            <InlineValue value={item} />
            {i < line.items.length - 1 ? ", " : ""}
          </span>
        ))}
        ]{line.comma ? "," : ""}
      </div>
    );
  }

  if (line.type === "close") {
    return (
      <div className="whitespace-pre" style={{ height: ROW_HEIGHT }}>
        {pad}
        {line.bracket}
        {line.comma ? "," : ""}
      </div>
    );
  }

  return null;
}

function JsonOpenRow({
  line,
  isExpanded,
  onToggle
}: {
  line: JsonLine & { type: "open-object" | "open-array" };
  isExpanded: boolean;
  onToggle: (id: string) => void;
}) {
  const pad = "  ".repeat(line.indent);
  const bracket = line.type === "open-object" ? "{" : "[";
  const closeBracket = line.type === "open-object" ? "}" : "]";
  const countLabel = line.type === "open-object" ? `${line.childCount} keys` : `${line.childCount} items`;

  const keyPrefix = line.key ? (
    <>
      <span className="text-purple-700 dark:text-purple-400">&quot;{line.key}&quot;</span>
      {": "}
    </>
  ) : null;

  return (
    <div className="whitespace-pre" style={{ height: ROW_HEIGHT }}>
      {pad}
      {keyPrefix}
      <button
        type="button"
        onClick={() => onToggle(line.id)}
        className="inline-flex items-center gap-0.5 text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className={`inline size-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        <span>{bracket}</span>
        {!isExpanded && (
          <>
            <span className="text-xs italic"> {countLabel} </span>
            <span>{closeBracket}</span>
          </>
        )}
      </button>
      {!isExpanded && line.comma ? "," : ""}
    </div>
  );
}

// ── Main component ───────────────────────────────────────

type JsonTreeProps = {
  data: unknown;
  collapseAllSignal: number;
  expandAllSignal: number;
};

export function JsonTree({ data, collapseAllSignal, expandAllSignal }: JsonTreeProps) {
  const [expanded, setExpanded] = useState(() => defaultExpanded(data));
  const parentRef = useRef<HTMLDivElement>(null);

  // Respond to collapse/expand all
  const lastCollapseRef = useRef(collapseAllSignal);
  const lastExpandRef = useRef(expandAllSignal);

  if (collapseAllSignal !== lastCollapseRef.current) {
    lastCollapseRef.current = collapseAllSignal;
    setExpanded(new Set());
  }
  if (expandAllSignal !== lastExpandRef.current) {
    lastExpandRef.current = expandAllSignal;
    setExpanded(new Set(collectExpandableIds(data)));
  }

  const lines = useMemo(() => flattenJson(data, expanded), [data, expanded]);

  const virtualizer = useVirtualizer({
    count: lines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 30
  });

  const handleToggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <div
      ref={parentRef}
      className="overflow-auto rounded-lg border bg-muted/50 p-4 font-mono text-xs leading-relaxed"
      style={{ height: "calc(100vh - 235px)" }}
    >
      <div className="relative w-fit min-w-full p-4" style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const line = lines[virtualRow.index];
          return (
            <div
              key={line.id}
              className="absolute left-0 top-0 w-full px-4"
              style={{ height: ROW_HEIGHT, transform: `translateY(${virtualRow.start}px)` }}
            >
              {line.type === "open-object" || line.type === "open-array" ? (
                <JsonOpenRow
                  line={line as JsonLine & { type: "open-object" | "open-array" }}
                  isExpanded={expanded.has(line.id)}
                  onToggle={handleToggle}
                />
              ) : (
                <JsonRow line={line} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
