import { ChevronRight } from "lucide-react";
import type { SearchResult } from "@/lib/blob/flatten-search";

function Highlighted({ text, query }: { text: string; query: string }) {
  const lower = text.toLowerCase();
  const parts: { text: string; match: boolean }[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const idx = lower.indexOf(query, cursor);
    if (idx === -1) {
      parts.push({ text: text.slice(cursor), match: false });
      break;
    }
    if (idx > cursor) parts.push({ text: text.slice(cursor, idx), match: false });
    parts.push({ text: text.slice(idx, idx + query.length), match: true });
    cursor = idx + query.length;
  }

  return (
    <>
      {parts.map((p, i) =>
        p.match ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: stable highlight segments
          <mark key={i} className="rounded-sm bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100">
            {p.text}
          </mark>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: stable highlight segments
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  );
}

function MatchValue({ value, matchType, query }: { value: string; matchType: "key" | "value"; query: string }) {
  if (matchType === "key") {
    return (
      <span className="text-purple-700 dark:text-purple-400">
        <Highlighted text={value} query={query} />
      </span>
    );
  }

  if (value.startsWith('"') && value.endsWith('"')) {
    return (
      <span className="text-green-700 dark:text-green-400">
        &quot;
        <Highlighted text={value.slice(1, -1)} query={query} />
        &quot;
      </span>
    );
  }

  if (value === "true" || value === "false") {
    return (
      <span className="text-amber-700 dark:text-amber-400">
        <Highlighted text={value} query={query} />
      </span>
    );
  }

  if (value === "null") {
    return (
      <span className="text-muted-foreground italic">
        <Highlighted text={value} query={query} />
      </span>
    );
  }

  return (
    <span className="text-blue-700 dark:text-blue-400">
      <Highlighted text={value} query={query} />
    </span>
  );
}

type SearchResultsListProps = {
  result: SearchResult;
  query: string;
};

export function SearchResultsList({ result, query }: SearchResultsListProps) {
  return (
    <div className="space-y-1">
      {result.truncated && (
        <p className="text-xs text-muted-foreground pb-1">
          Showing {result.matches.length} of {result.total} matches
        </p>
      )}
      {result.matches.length === 0 && <p className="text-sm text-muted-foreground py-4">No matches found.</p>}
      {result.matches.map((match, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: stable search result order
        <div key={i} className="flex items-baseline gap-2 py-0.5">
          <span className="flex shrink-0 items-center gap-0.5 text-muted-foreground">
            {match.path.map((segment, j) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: stable path segments
              <span key={j} className="flex items-center gap-0.5">
                {j > 0 && <ChevronRight className="inline size-2.5 shrink-0" />}
                <span className="text-[11px]">{segment}</span>
              </span>
            ))}
          </span>
          <span className="text-xs">
            <MatchValue value={match.value} matchType={match.matchType} query={query} />
          </span>
        </div>
      ))}
    </div>
  );
}
