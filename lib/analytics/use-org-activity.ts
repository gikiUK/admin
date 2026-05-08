"use client";

import { useEffect, useState } from "react";
import { fetchOrganizationActivity } from "@/lib/analytics/api";
import { ApiError } from "@/lib/api/client";

type RawPoint = { date: string; by_type: Record<string, number> };

type State =
  | { status: "loading" }
  | { status: "ready"; data: RawPoint[] }
  | { status: "pending-backend" }
  | { status: "error"; message: string };

export function useOrgActivity(slug: string, from: string, to: string): State {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchOrganizationActivity(slug, from, to)
      .then((response) => {
        if (!cancelled) setState({ status: "ready", data: response.events_over_time_by_type });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.isNotFound()) {
          setState({ status: "pending-backend" });
        } else {
          setState({ status: "error", message: err instanceof Error ? err.message : "Failed to load activity" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug, from, to]);

  return state;
}

export function useOrgPreviousActivity(slug: string, from: string, to: string, enabled: boolean): State | null {
  const [state, setState] = useState<State | null>(enabled ? { status: "loading" } : null);

  useEffect(() => {
    if (!enabled) {
      setState(null);
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    fetchOrganizationActivity(slug, from, to)
      .then((response) => {
        if (!cancelled) setState({ status: "ready", data: response.events_over_time_by_type });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.isNotFound()) {
          setState({ status: "ready", data: [] });
        } else {
          setState({ status: "error", message: err instanceof Error ? err.message : "Failed to load activity" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug, from, to, enabled]);

  return state;
}
