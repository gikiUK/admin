"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { OrgsTable } from "@/components/manage/orgs-table";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { Pager } from "@/components/ui/pager";
import { type CompaniesFilter, fetchCompanies, type ManagedCompany } from "@/lib/manage/api";
import { useUrlState } from "@/lib/use-url-state";

function readFilter(searchParams: URLSearchParams): CompaniesFilter {
  const page = Number(searchParams.get("page") ?? 1);
  return {
    name: searchParams.get("name") ?? undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1
  };
}

export function OrgsExplorer() {
  const { searchParams, set } = useUrlState();
  const filter = useMemo(() => readFilter(searchParams), [searchParams]);

  const [companies, setCompanies] = useState<ManagedCompany[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, total_count: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchCompanies(filter)
      .then((response) => {
        setCompanies(response.results);
        setMeta(response.meta);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load organisations"))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleNameChange = useCallback(
    (value: string) => {
      set({ name: value || undefined, page: 1 });
    },
    [set]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      set({ page });
    },
    [set]
  );

  return (
    <div className="space-y-4">
      <div className="flex max-w-md">
        <DebouncedInput
          value={filter.name ?? ""}
          onCommit={handleNameChange}
          placeholder="Search by name…"
          aria-label="Search organisations"
        />
      </div>
      {error && <div className="text-sm text-destructive">{error}</div>}
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading organisations…</div>
      ) : (
        <OrgsTable companies={companies} />
      )}
      <Pager
        page={meta.current_page}
        totalPages={meta.total_pages}
        totalCount={meta.total_count}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
