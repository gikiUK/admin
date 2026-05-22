"use client";

import { useSearchParams } from "next/navigation";
import { DEFAULT_PRESET, isPreset, presetToRange } from "@/components/analytics/date-range-picker";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SummaryProvider } from "@/lib/analytics/summary-context";

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const rawPreset = searchParams.get("range");
  const preset = isPreset(rawPreset) ? rawPreset : DEFAULT_PRESET;
  const { from, to } = presetToRange(preset);

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
