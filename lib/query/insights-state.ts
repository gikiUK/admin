import type { UseQueryResult } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/client";

export type InsightsState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "pending-backend" }
  | { status: "error"; message: string };

export function isPendingBackendError(error: unknown): boolean {
  return error instanceof ApiError && error.isNotFound();
}

/**
 * Adapts a useQuery result into the discriminated union our async UI consumes.
 * Disabled queries (`fetchStatus === "idle"` while `isPending`) collapse to a
 * synthetic "ready" state if the caller supplies an `emptyData` value — this
 * preserves the empty-input shortcut the bespoke hooks used (e.g. empty key list).
 */
export function toInsightsState<T>(query: UseQueryResult<T>, emptyData?: T): InsightsState<T> {
  if (query.isError) {
    if (isPendingBackendError(query.error)) return { status: "pending-backend" };
    const message = query.error instanceof Error ? query.error.message : "Failed to load";
    return { status: "error", message };
  }
  if (query.data !== undefined) return { status: "ready", data: query.data };
  if (emptyData !== undefined && query.fetchStatus === "idle" && query.isPending) {
    return { status: "ready", data: emptyData };
  }
  return { status: "loading" };
}
