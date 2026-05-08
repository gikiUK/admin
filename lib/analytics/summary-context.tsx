"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";
import type { AnalyticsSummary } from "@/lib/analytics/api";
import { useSummary } from "@/lib/analytics/use-summary";

type SummaryState =
  | { status: "loading" }
  | { status: "ready"; data: AnalyticsSummary }
  | { status: "pending-backend" }
  | { status: "error"; message: string };

const SummaryContext = createContext<SummaryState | null>(null);

type ProviderProps = {
  from: string;
  to: string;
  children: ReactNode;
};

export function SummaryProvider({ from, to, children }: ProviderProps) {
  const summary = useSummary(from, to);
  const value = useMemo(() => summary, [summary]);
  return <SummaryContext.Provider value={value}>{children}</SummaryContext.Provider>;
}

export function useSummaryContext(): SummaryState {
  const value = useContext(SummaryContext);
  if (!value) throw new Error("useSummaryContext must be used inside <SummaryProvider>");
  return value;
}
