"use client";

import { CohortProvider } from "@/lib/analytics/insights/cohort-context";

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return <CohortProvider>{children}</CohortProvider>;
}
