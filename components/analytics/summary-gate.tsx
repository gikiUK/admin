"use client";

import type { ReactNode } from "react";
import { PendingBackend } from "@/components/analytics/pending-backend";
import type { AnalyticsSummary } from "@/lib/analytics/api";
import { useSummaryContext } from "@/lib/analytics/summary-context";

type Props = {
  loadingLabel?: string;
  children: (data: AnalyticsSummary) => ReactNode;
};

export function SummaryGate({ loadingLabel = "Loading…", children }: Props) {
  const summary = useSummaryContext();
  if (summary.status === "loading") return <div className="text-sm text-muted-foreground">{loadingLabel}</div>;
  if (summary.status === "pending-backend") return <PendingBackend endpoint="GET /admin/analytics/summary" />;
  if (summary.status === "error") return <div className="text-sm text-destructive">{summary.message}</div>;
  return <>{children(summary.data)}</>;
}
