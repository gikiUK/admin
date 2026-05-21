"use client";

import { useEffect, useState } from "react";
import { type ActionKind, type ActionLeaderboard, fetchActionLeaderboard } from "@/lib/analytics/actions-api";
import { ApiError } from "@/lib/api/client";

type LeaderboardState =
  | { status: "loading" }
  | { status: "ready"; data: ActionLeaderboard }
  | { status: "pending-backend" }
  | { status: "error"; message: string };

export function useActionLeaderboard(from: string, to: string, kind: ActionKind = "both"): LeaderboardState {
  const [state, setState] = useState<LeaderboardState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchActionLeaderboard({ from, to, kind })
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
            message: err instanceof Error ? err.message : "Failed to load leaderboard"
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [from, to, kind]);

  return state;
}
