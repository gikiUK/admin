"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CatalogQuadrant } from "@/components/analytics/actions/catalog-quadrant";
import { CorrelationsSection } from "@/components/analytics/actions/correlations-section";
import { EngagementScatter } from "@/components/analytics/actions/engagement-scatter";
import { FunnelSection } from "@/components/analytics/actions/funnel-section";
import { LeaderboardChart } from "@/components/analytics/actions/leaderboard-chart";
import { TrendsSection } from "@/components/analytics/actions/trends-section";
import { DateRangePicker, isPreset, presetToRange } from "@/components/analytics/date-range-picker";
import { PendingBackend } from "@/components/analytics/pending-backend";
import { PageHeader } from "@/components/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACTION_KINDS, type ActionKind } from "@/lib/analytics/actions-api";
import { useActionCorrelations } from "@/lib/analytics/use-action-correlations";
import { useActionFunnel } from "@/lib/analytics/use-action-funnel";
import { useActionLeaderboard } from "@/lib/analytics/use-action-leaderboard";
import { useActionTrends } from "@/lib/analytics/use-action-trends";

const ACTIONS_DEFAULT_PRESET = "90d" as const;

const KIND_LABELS: Record<ActionKind, string> = {
  both: "System + custom",
  system: "System actions",
  custom: "Custom actions"
};

export default function AnalyticsActionsPage() {
  const searchParams = useSearchParams();
  const rawPreset = searchParams.get("range");
  const initialPreset = isPreset(rawPreset) ? rawPreset : ACTIONS_DEFAULT_PRESET;
  const [preset, setPreset] = useState(initialPreset);
  const [kind, setKind] = useState<ActionKind>("both");

  const { from, to } = useMemo(() => presetToRange(preset), [preset]);
  const leaderboard = useActionLeaderboard(from, to, kind);
  const funnel = useActionFunnel(from, to, kind);
  const correlations = useActionCorrelations(from, to, kind);
  const trends = useActionTrends(12, kind);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Actions"
        description="How users pick, progress, and complete climate actions."
        action={
          <div className="flex items-center gap-2">
            <Select value={kind} onValueChange={(value) => setKind(value as ActionKind)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_KINDS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {KIND_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DateRangePicker value={preset} onChange={setPreset} />
          </div>
        }
      />

      <section className="space-y-3">
        {funnel.status === "loading" && <div className="text-sm text-muted-foreground">Loading funnel…</div>}
        {funnel.status === "pending-backend" && <PendingBackend endpoint="GET /admin/analytics/actions/funnel" />}
        {funnel.status === "error" && <div className="text-sm text-destructive">{funnel.message}</div>}
        {funnel.status === "ready" && <FunnelSection data={funnel.data} />}
      </section>

      <section className="space-y-3">
        {correlations.status === "loading" && (
          <div className="text-sm text-muted-foreground">Loading correlations…</div>
        )}
        {correlations.status === "pending-backend" && (
          <PendingBackend endpoint="GET /admin/analytics/actions/correlations" />
        )}
        {correlations.status === "error" && <div className="text-sm text-destructive">{correlations.message}</div>}
        {correlations.status === "ready" && <CorrelationsSection data={correlations.data} />}
      </section>

      <section className="space-y-3">
        {leaderboard.status === "loading" && <div className="text-sm text-muted-foreground">Loading actions…</div>}
        {leaderboard.status === "pending-backend" && <PendingBackend endpoint="GET /admin/analytics/actions" />}
        {leaderboard.status === "error" && <div className="text-sm text-destructive">{leaderboard.message}</div>}
        {leaderboard.status === "ready" && <EngagementScatter rows={leaderboard.data.actions} />}
      </section>

      <section className="space-y-3">
        {leaderboard.status === "loading" && <div className="text-sm text-muted-foreground">Loading leaderboard…</div>}
        {leaderboard.status === "pending-backend" && <PendingBackend endpoint="GET /admin/analytics/actions" />}
        {leaderboard.status === "error" && <div className="text-sm text-destructive">{leaderboard.message}</div>}
        {leaderboard.status === "ready" && <LeaderboardChart rows={leaderboard.data.actions} />}
      </section>

      <section className="space-y-3">
        {leaderboard.status === "loading" && <div className="text-sm text-muted-foreground">Loading catalog…</div>}
        {leaderboard.status === "pending-backend" && <PendingBackend endpoint="GET /admin/analytics/actions" />}
        {leaderboard.status === "error" && <div className="text-sm text-destructive">{leaderboard.message}</div>}
        {leaderboard.status === "ready" && <CatalogQuadrant rows={leaderboard.data.actions} />}
      </section>

      <section className="space-y-3">
        {trends.status === "loading" && <div className="text-sm text-muted-foreground">Loading trends…</div>}
        {trends.status === "pending-backend" && <PendingBackend endpoint="GET /admin/analytics/actions/trends" />}
        {trends.status === "error" && <div className="text-sm text-destructive">{trends.message}</div>}
        {trends.status === "ready" && <TrendsSection data={trends.data} />}
      </section>
    </div>
  );
}
