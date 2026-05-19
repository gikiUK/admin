"use client";

import { useEffect, useState } from "react";
import { type ActionKind, type ActionTrends, fetchActionTrends } from "@/lib/analytics/actions-api";
import { ApiError } from "@/lib/api/client";

type TrendsState =
  | { status: "loading" }
  | { status: "ready"; data: ActionTrends }
  | { status: "pending-backend" }
  | { status: "error"; message: string };

export function useActionTrends(weeks: number, kind: ActionKind = "both"): TrendsState {
  const [state, setState] = useState<TrendsState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchActionTrends({ weeks, kind })
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.isNotFound()) {
          setState({ status: "pending-backend" });
        } else {
          setState({
            status: "error",
            message: err instanceof Error ? err.message : "Failed to load trends"
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [weeks, kind]);

  return state;
}
