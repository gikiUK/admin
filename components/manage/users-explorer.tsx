"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { UsersTable } from "@/components/manage/users-table";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { Pager } from "@/components/ui/pager";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  type AnalyticsUser,
  fetchUsers,
  USER_STATUSES,
  type UserStatus,
  type UsersFilter,
  type UsersOrder
} from "@/lib/analytics/api";
import { useUrlState } from "@/lib/use-url-state";

const ORDERS: Array<{ value: UsersOrder; label: string }> = [
  { value: "newest_signup", label: "Newest signups" },
  { value: "oldest_signup", label: "Oldest signups" }
];

const STATUS_ANY = "any";

function isUserStatus(value: string | null): value is UserStatus {
  return value !== null && (USER_STATUSES as readonly string[]).includes(value);
}

function isUserOrder(value: string | null): value is UsersOrder {
  return value === "newest_signup" || value === "oldest_signup";
}

function readFilter(searchParams: URLSearchParams): UsersFilter {
  const page = Number(searchParams.get("page") ?? 1);
  const status = searchParams.get("status");
  const order = searchParams.get("order");
  return {
    query: searchParams.get("query") ?? undefined,
    company_id: searchParams.get("company_id") ?? undefined,
    status: isUserStatus(status) ? status : undefined,
    order: isUserOrder(order) ? order : "newest_signup",
    page: Number.isFinite(page) && page > 0 ? page : 1
  };
}

export function UsersExplorer() {
  const { searchParams, set } = useUrlState();
  const filter = useMemo(() => readFilter(searchParams), [searchParams]);

  const [users, setUsers] = useState<AnalyticsUser[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, total_count: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchUsers(filter)
      .then((response) => {
        setUsers(response.results);
        setMeta(response.meta);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load users"))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleQueryChange = useCallback(
    (value: string) => {
      set({ query: value || undefined, page: 1 });
    },
    [set]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      set({ status: value === STATUS_ANY ? undefined : value, page: 1 });
    },
    [set]
  );

  const handleOrderChange = useCallback(
    (value: string) => {
      set({ order: value, page: 1 });
    },
    [set]
  );

  const handleCompanyChange = useCallback(
    (value: string) => {
      set({ company_id: value || undefined, page: 1 });
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
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[200px] flex-1 max-w-md">
          <DebouncedInput
            value={filter.query ?? ""}
            onCommit={handleQueryChange}
            placeholder="Search by name or email…"
            aria-label="Search users"
          />
        </div>
        <div className="w-[160px]">
          <DebouncedInput
            value={filter.company_id ?? ""}
            onCommit={handleCompanyChange}
            placeholder="Company id"
            aria-label="Filter by company id"
          />
        </div>
        <Select value={filter.status ?? STATUS_ANY} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[150px]" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={STATUS_ANY}>Any status</SelectItem>
            {USER_STATUSES.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filter.order ?? "newest_signup"} onValueChange={handleOrderChange}>
          <SelectTrigger className="w-[180px]" aria-label="Sort order">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDERS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <div className="text-sm text-destructive">{error}</div>}
      {loading ? <div className="text-sm text-muted-foreground">Loading users…</div> : <UsersTable users={users} />}
      <Pager
        page={meta.current_page}
        totalPages={meta.total_pages}
        totalCount={meta.total_count}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
