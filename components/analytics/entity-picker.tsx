"use client";

import { Loader2, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { INPUT_COMMIT_DELAY_MS } from "@/lib/debounce";

export type EntityResult = {
  id: number;
  /** Primary text shown in the result list and in the filled chip. */
  label: string;
  /** Optional secondary text (e.g. email or slug). */
  hint?: string;
};

type Props = {
  placeholder: string;
  selectedLabel?: string;
  onPick: (entity: EntityResult) => void;
  onClear: () => void;
  search: (query: string) => Promise<EntityResult[]>;
};

export function EntityPicker({ placeholder, selectedLabel, onPick, onClear, search }: Props) {
  if (selectedLabel) {
    return (
      <div className="flex h-9 items-center justify-between gap-2 rounded-md border bg-background px-3 text-sm">
        <span className="truncate">{selectedLabel}</span>
        <Button variant="ghost" size="sm" className="-mr-2 h-6 gap-1 px-2 text-xs" onClick={onClear}>
          <X className="size-3" />
          Clear
        </Button>
      </div>
    );
  }
  return <SearchTrigger placeholder={placeholder} search={search} onPick={onPick} />;
}

type SearchTriggerProps = {
  placeholder: string;
  search: (query: string) => Promise<EntityResult[]>;
  onPick: (entity: EntityResult) => void;
};

function SearchTrigger({ placeholder, search, onPick }: SearchTriggerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EntityResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    let cancelled = false;
    const timer = setTimeout(() => {
      search(trimmed)
        .then((entities) => {
          if (!cancelled) setResults(entities);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, INPUT_COMMIT_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground hover:bg-muted"
        >
          <Search className="size-3.5 shrink-0" />
          <span className="truncate">{placeholder}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <div className="border-b p-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            autoFocus
            className="h-8 text-sm"
          />
        </div>
        <ResultList
          query={query}
          results={results}
          searching={searching}
          onPick={(entity) => {
            onPick(entity);
            setOpen(false);
            setQuery("");
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

type ResultListProps = {
  query: string;
  results: EntityResult[];
  searching: boolean;
  onPick: (entity: EntityResult) => void;
};

function ResultList({ query, results, searching, onPick }: ResultListProps) {
  if (query.trim().length < 2) {
    return <div className="p-3 text-xs text-muted-foreground">Type at least 2 characters to search.</div>;
  }
  if (searching) {
    return (
      <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        Searching…
      </div>
    );
  }
  if (results.length === 0) {
    return <div className="p-3 text-xs text-muted-foreground">No matches found.</div>;
  }
  return (
    <ul className="max-h-60 overflow-y-auto py-1">
      {results.map((entity) => (
        <li key={entity.id}>
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
            onClick={() => onPick(entity)}
          >
            <div className="font-medium">{entity.label}</div>
            {entity.hint && <div className="text-xs text-muted-foreground">{entity.hint}</div>}
          </button>
        </li>
      ))}
    </ul>
  );
}
