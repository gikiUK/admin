"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { OrgFilters } from "@/components/analytics/org-filters";
import { OrgsTable } from "@/components/analytics/orgs-table";
import { Pager } from "@/components/ui/pager";
import { ORG_STATUSES, ORG_TIERS, type OrgStatus, type OrgsFilter, type OrgTier } from "@/lib/analytics/api";
import { organizationsQuery } from "@/lib/analytics/queries";
import { useUrlState } from "@/lib/use-url-state";

const FILTER_KEYS = ["query", "tier", "status", "order", "page"] as const;

function readFilter(searchParams: URLSearchParams): OrgsFilter {
  const order = searchParams.get("order");
  const status = searchParams.get("status");
  const tier = searchParams.get("tier");
  const page = Number(searchParams.get("page") ?? 1);
  const validOrder =
    order === "most_active" ||
    order === "least_active" ||
    order === "most_events" ||
    order === "newest_signup" ||
    order === "oldest_signup" ||
    order === "most_members" ||
    order === "fewest_members" ||
    order === "oldest_active";
  const validStatus = status !== null && (ORG_STATUSES as readonly string[]).includes(status);
  const validTier = tier !== null && (ORG_TIERS as readonly string[]).includes(tier);
  return {
    query: searchParams.get("query") ?? undefined,
    tier: validTier ? (tier as OrgTier) : undefined,
    status: validStatus ? (status as OrgStatus) : undefined,
    order: validOrder ? (order as OrgsFilter["order"]) : undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1
  };
}

const EMPTY_META = { current_page: 1, total_count: 0, total_pages: 1 };

type OrgsExplorerProps = {
  onSelect?: (slug: string) => void;
};

export function OrgsExplorer({ onSelect }: OrgsExplorerProps = {}) {
  const { searchParams, set } = useUrlState();
  const filter = useMemo(() => readFilter(searchParams), [searchParams]);

  const query = useQuery(organizationsQuery(filter));
  const organizations = query.data?.results ?? [];
  const meta = query.data?.meta ?? EMPTY_META;
  const errorMessage = query.isError
    ? query.error instanceof Error
      ? query.error.message
      : "Failed to load organisations"
    : "";

  const handleFilterChange = useCallback(
    (patch: Partial<OrgsFilter>) => {
      set({ ...patch, page: 1 });
    },
    [set]
  );

  const handleReset = useCallback(() => {
    set(Object.fromEntries(FILTER_KEYS.map((key) => [key, undefined])));
  }, [set]);

  const handlePageChange = useCallback(
    (page: number) => {
      set({ page });
    },
    [set]
  );

  return (
    <div className="space-y-4">
      <OrgFilters filter={filter} onChange={handleFilterChange} onReset={handleReset} />
      {errorMessage && <div className="text-sm text-destructive">{errorMessage}</div>}
      {query.isPending ? (
        <div className="text-sm text-muted-foreground">Loading organisations…</div>
      ) : (
        <OrgsTable
          organizations={organizations}
          onSelect={onSelect ? (org) => onSelect(org.slug) : undefined}
          order={filter.order}
          onOrderChange={(order) => handleFilterChange({ order })}
        />
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
