"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { UserFilters } from "@/components/analytics/user-filters";
import { UsersTable } from "@/components/analytics/users-table";
import { Pager } from "@/components/ui/pager";
import { USER_STATUSES, type UserStatus, type UsersFilter } from "@/lib/analytics/api";
import { usersQuery } from "@/lib/analytics/queries";
import { useUrlState } from "@/lib/use-url-state";

const FILTER_KEYS = ["query", "company_id", "status", "order", "page"] as const;

function readFilter(searchParams: URLSearchParams): UsersFilter {
  const order = searchParams.get("order");
  const status = searchParams.get("status");
  const page = Number(searchParams.get("page") ?? 1);
  const validOrder =
    order === "most_active" || order === "least_active" || order === "newest_signup" || order === "oldest_signup";
  const validStatus = status !== null && (USER_STATUSES as readonly string[]).includes(status);
  return {
    query: searchParams.get("query") ?? undefined,
    company_id: searchParams.get("company_id") ?? undefined,
    status: validStatus ? (status as UserStatus) : undefined,
    order: validOrder ? (order as UsersFilter["order"]) : undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1
  };
}

const EMPTY_META = { current_page: 1, total_count: 0, total_pages: 1 };

export function UsersExplorer() {
  const { searchParams, set } = useUrlState();
  const filter = useMemo(() => readFilter(searchParams), [searchParams]);

  const query = useQuery(usersQuery(filter));
  const users = query.data?.results ?? [];
  const meta = query.data?.meta ?? EMPTY_META;
  const errorMessage = query.isError
    ? query.error instanceof Error
      ? query.error.message
      : "Failed to load users"
    : "";

  const handleFilterChange = useCallback(
    (patch: Partial<UsersFilter>) => {
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
      <UserFilters filter={filter} onChange={handleFilterChange} onReset={handleReset} />
      {errorMessage && <div className="text-sm text-destructive">{errorMessage}</div>}
      {query.isPending ? (
        <div className="text-sm text-muted-foreground">Loading users…</div>
      ) : (
        <UsersTable users={users} />
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
