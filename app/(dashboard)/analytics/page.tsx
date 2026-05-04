"use client";

import { useMemo } from "react";
import { ActivityTab } from "@/components/analytics/activity-tab";
import { BreakdownsSection } from "@/components/analytics/breakdowns-section";
import { DateRangePicker, DEFAULT_PRESET, isPreset, presetToRange } from "@/components/analytics/date-range-picker";
import { EventsExplorer } from "@/components/analytics/events-explorer";
import { OverviewTab } from "@/components/analytics/overview-tab";
import { PendingBackend } from "@/components/analytics/pending-backend";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSummary } from "@/lib/analytics/use-summary";
import { useUrlState } from "@/lib/use-url-state";

const TABS = ["overview", "activity", "breakdowns", "events"] as const;
type TabId = (typeof TABS)[number];

const TAB_LABEL: Record<TabId, string> = {
  overview: "Overview",
  activity: "Activity",
  breakdowns: "Breakdowns",
  events: "Events"
};

function isTabId(value: string | null): value is TabId {
  return value !== null && (TABS as readonly string[]).includes(value);
}

export default function AnalyticsPage() {
  const { searchParams, set } = useUrlState();

  const rawPreset = searchParams.get("range");
  const preset = isPreset(rawPreset) ? rawPreset : DEFAULT_PRESET;
  const { from, to } = useMemo(() => presetToRange(preset), [preset]);

  const rawTab = searchParams.get("tab");
  const activeTab: TabId = isTabId(rawTab) ? rawTab : "overview";

  const summary = useSummary(from, to);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Engagement, plan progress, and conversion metrics"
        action={<DateRangePicker value={preset} onChange={(next) => set({ range: next })} />}
      />

      <Tabs value={activeTab} onValueChange={(value) => set({ tab: value })}>
        <TabsList variant="line">
          {TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {TAB_LABEL[tab]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab
            data={summary.status === "ready" ? summary.data : null}
            isLoading={summary.status === "loading"}
          />
          {summary.status === "pending-backend" && <PendingBackend endpoint="GET /admin/analytics/summary" />}
          {summary.status === "error" && <div className="text-sm text-destructive">{summary.message}</div>}
        </TabsContent>

        <TabsContent value="activity">
          {summary.status === "ready" && <ActivityTab data={summary.data} />}
          {summary.status === "loading" && <div className="text-sm text-muted-foreground">Loading activity…</div>}
          {summary.status === "pending-backend" && <PendingBackend endpoint="GET /admin/analytics/summary" />}
          {summary.status === "error" && <div className="text-sm text-destructive">{summary.message}</div>}
        </TabsContent>

        <TabsContent value="breakdowns">
          {summary.status === "ready" && <BreakdownsSection data={summary.data} />}
          {summary.status === "loading" && <div className="text-sm text-muted-foreground">Loading breakdowns…</div>}
          {summary.status === "pending-backend" && <PendingBackend endpoint="GET /admin/analytics/summary" />}
          {summary.status === "error" && <div className="text-sm text-destructive">{summary.message}</div>}
        </TabsContent>

        <TabsContent value="events">
          <EventsExplorer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
