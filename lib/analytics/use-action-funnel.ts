"use client";

import { useEffect, useState } from "react";
import { type ActionFunnel, type ActionKind, fetchActionFunnel } from "@/lib/analytics/actions-api";
import { ApiError } from "@/lib/api/client";

type FunnelState =
  | { status: "loading" }
  | { status: "ready"; data: ActionFunnel }
  | { status: "pending-backend" }
  | { status: "error"; message: string };

export function useActionFunnel(from: string, to: string, kind: ActionKind = "both"): FunnelState {
  const [state, setState] = useState<FunnelState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchActionFunnel({ from, to, kind })
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
            message: err instanceof Error ? err.message : "Failed to load funnel"
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [from, to, kind]);

  return state;
}
