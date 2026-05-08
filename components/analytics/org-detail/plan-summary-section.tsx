import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsOrganizationDetail } from "@/lib/analytics/api";
import { getFrontendUrl } from "@/lib/api/config";
import { formatPercent } from "./format";
import { StackedBar } from "./stacked-bar";

const STATUS_BAR_SEGMENTS: Array<{ key: string; label: string; className: string }> = [
  { key: "completed", label: "Completed", className: "bg-emerald-500" },
  { key: "in_progress", label: "In progress", className: "bg-sky-500" },
  { key: "not_started", label: "Not started", className: "bg-muted-foreground/40" },
  { key: "rejected", label: "Not relevant", className: "bg-rose-500" },
  { key: "archived", label: "Archived", className: "bg-muted-foreground/20" }
];

const PRE_GIKI_BAR_SEGMENTS: Array<{ key: string; label: string; className: string }> = [
  { key: "already_doing", label: "Already doing", className: "bg-violet-500" },
  { key: "previously_done", label: "Previously done", className: "bg-violet-500/50" }
];

export function PlanSummarySection({ org }: { org: AnalyticsOrganizationDetail }) {
  const actions = org.tracked_actions;
  const total = actions.length;
  const byStatus = actions.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});
  const byPreGiki = actions.reduce<Record<string, number>>((acc, a) => {
    if (a.pre_giki_status) acc[a.pre_giki_status] = (acc[a.pre_giki_status] ?? 0) + 1;
    return acc;
  }, {});
  const preGikiTotal = (byPreGiki.already_doing ?? 0) + (byPreGiki.previously_done ?? 0);
  const planUrl = org.plan_uuid
    ? getFrontendUrl(`/companies/${encodeURIComponent(org.slug)}/plans/${org.plan_uuid}`)
    : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">Plan</CardTitle>
        {planUrl && (
          <Link
            href={planUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs hover:bg-muted"
          >
            View plan
            <ExternalLink className="size-3" />
          </Link>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <StackedBar
          title="Action status"
          total={total}
          totalLabel={`${total.toLocaleString()} actions`}
          segments={STATUS_BAR_SEGMENTS.map((s) => ({ ...s, count: byStatus[s.key] ?? 0 }))}
          rightLabel={total > 0 ? `${formatPercent(org.completion_rate)} complete` : undefined}
        />
        {preGikiTotal > 0 && (
          <StackedBar
            title="Onboarding pre-giki"
            total={preGikiTotal}
            totalLabel={`${preGikiTotal.toLocaleString()} of ${total.toLocaleString()} flagged`}
            segments={PRE_GIKI_BAR_SEGMENTS.map((s) => ({ ...s, count: byPreGiki[s.key] ?? 0 }))}
          />
        )}
      </CardContent>
    </Card>
  );
}
