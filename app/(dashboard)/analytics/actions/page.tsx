"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ActionKindSelect } from "@/components/analytics/actions/action-kind-select";
import { CatalogQuadrant } from "@/components/analytics/actions/catalog/catalog-quadrant";
import { CorrelationsSection } from "@/components/analytics/actions/correlations/correlations-section";
import { EngagementScatter } from "@/components/analytics/actions/engagement/engagement-scatter";
import { FunnelSection } from "@/components/analytics/actions/funnel/funnel-section";
import { LeaderboardChart } from "@/components/analytics/actions/leaderboard/leaderboard-chart";
import { TrendsSection } from "@/components/analytics/actions/trends/trends-section";
import { AsyncSection } from "@/components/analytics/async-section";
import { DateRangePicker, isPreset, presetToRange } from "@/components/analytics/date-range-picker";
import { PageHeader } from "@/components/page-header";
import type { ActionKind } from "@/lib/analytics/actions-api";
import { useActionCorrelations } from "@/lib/analytics/use-action-correlations";
import { useActionFunnel } from "@/lib/analytics/use-action-funnel";
import { useActionLeaderboard } from "@/lib/analytics/use-action-leaderboard";
import { useActionTrends } from "@/lib/analytics/use-action-trends";

const ACTIONS_DEFAULT_PRESET = "90d" as const;

export default function AnalyticsActionsPage() {
  const searchParams = useSearchParams();
  const rawPreset = searchParams.get("range");
  const [preset, setPreset] = useState(isPreset(rawPreset) ? rawPreset : ACTIONS_DEFAULT_PRESET);
  const [kind, setKind] = useState<ActionKind>("both");

  const { from, to } = presetToRange(preset);
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
            <ActionKindSelect value={kind} onChange={setKind} />
            <DateRangePicker value={preset} onChange={setPreset} />
          </div>
        }
      />

      <AsyncSection state={funnel} endpoint="GET /admin/analytics/actions/funnel" loadingLabel="Loading funnel…">
        {(data) => <FunnelSection data={data} />}
      </AsyncSection>

      <AsyncSection
        state={correlations}
        endpoint="GET /admin/analytics/actions/correlations"
        loadingLabel="Loading correlations…"
      >
        {(data) => <CorrelationsSection data={data} />}
      </AsyncSection>

      <AsyncSection state={leaderboard} endpoint="GET /admin/analytics/actions" loadingLabel="Loading actions…">
        {(data) => <EngagementScatter rows={data.actions} />}
      </AsyncSection>

      <AsyncSection state={leaderboard} endpoint="GET /admin/analytics/actions" loadingLabel="Loading leaderboard…">
        {(data) => <LeaderboardChart rows={data.actions} />}
      </AsyncSection>

      <AsyncSection state={leaderboard} endpoint="GET /admin/analytics/actions" loadingLabel="Loading catalog…">
        {(data) => <CatalogQuadrant rows={data.actions} />}
      </AsyncSection>

      <AsyncSection state={trends} endpoint="GET /admin/analytics/actions/trends" loadingLabel="Loading trends…">
        {(data) => <TrendsSection data={data} />}
      </AsyncSection>
    </div>
  );
}
