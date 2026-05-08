"use client";

import { useMemo } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SummaryProvider } from "@/lib/analytics/summary-context";

const SUMMARY_RANGE_DAYS = 30;

function defaultRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - SUMMARY_RANGE_DAYS);
  return { from: from.toISOString(), to: to.toISOString() };
}

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const { from, to } = useMemo(defaultRange, []);

  return (
    <SidebarInset>
      <header className="bg-background sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
      </header>
      <main className="flex-1 p-6">
        <SummaryProvider from={from} to={to}>
          {children}
        </SummaryProvider>
      </main>
    </SidebarInset>
  );
}
