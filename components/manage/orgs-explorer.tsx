"use client";

import { useQuery } from "@tanstack/react-query";
import { OrgsTable } from "@/components/manage/orgs-table";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { Pager } from "@/components/ui/pager";
import type { CompaniesFilter } from "@/lib/manage/api";
import { companiesQuery } from "@/lib/manage/queries";
import { useUrlState } from "@/lib/use-url-state";

const EMPTY_META = { current_page: 1, total_count: 0, total_pages: 1 };

function readFilter(searchParams: URLSearchParams): CompaniesFilter {
  const page = Number(searchParams.get("page") ?? 1);
  return {
    name: searchParams.get("name") ?? undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1
  };
}

export function OrgsExplorer() {
  const { searchParams, set } = useUrlState();
  const filter = readFilter(searchParams);

  const query = useQuery(companiesQuery(filter));
  const companies = query.data?.results ?? [];
  const meta = query.data?.meta ?? EMPTY_META;
  const errorMessage = query.isError
    ? query.error instanceof Error
      ? query.error.message
      : "Failed to load organisations"
    : "";

  function handleNameChange(value: string) {
    set({ name: value || undefined, page: 1 });
  }

  function handlePageChange(page: number) {
    set({ page });
  }

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
      {errorMessage && <div className="text-sm text-destructive">{errorMessage}</div>}
      {query.isPending ? (
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
