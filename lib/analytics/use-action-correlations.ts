"use client";

import { useEffect, useState } from "react";
import { type ActionCorrelations, type ActionKind, fetchActionCorrelations } from "@/lib/analytics/actions-api";
import { ApiError } from "@/lib/api/client";

type CorrelationsState =
  | { status: "loading" }
  | { status: "ready"; data: ActionCorrelations }
  | { status: "pending-backend" }
  | { status: "error"; message: string };

export function useActionCorrelations(from: string, to: string, kind: ActionKind = "both"): CorrelationsState {
  const [state, setState] = useState<CorrelationsState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchActionCorrelations({ from, to, kind })
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
            message: err instanceof Error ? err.message : "Failed to load correlations"
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [from, to, kind]);

  return state;
}
