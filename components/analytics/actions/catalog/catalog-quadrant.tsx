"use client";

import { buildCatalogPoints } from "@/components/analytics/actions/catalog/catalog-points";
import { CatalogQuadrantChart } from "@/components/analytics/actions/catalog/catalog-quadrant-chart";
import { CatalogQuadrantLegend } from "@/components/analytics/actions/catalog/catalog-quadrant-legend";
import { SectionCard } from "@/components/analytics/actions/shared/section-card";
import type { ActionLeaderboardRow } from "@/lib/analytics/actions-api";

type Props = {
  rows: ActionLeaderboardRow[];
  minAdoption?: number;
};

export function CatalogQuadrant({ rows, minAdoption = 1 }: Props) {
  const { points, xMedian, yMedian, useLogScale } = buildCatalogPoints(rows, minAdoption);

  return (
    <SectionCard
      title="Catalog health"
      description="X = adoption count (log). Y = completion rate. Quadrant boundaries are the medians of each axis. Top-right stars, bottom-left kill candidates."
      empty={points.length === 0 ? "No actions adopted in this range." : undefined}
    >
      <div style={{ width: "100%", height: 380, position: "relative" }}>
        <CatalogQuadrantChart points={points} xMedian={xMedian} yMedian={yMedian} useLogScale={useLogScale} />
        <CatalogQuadrantLegend />
      </div>
    </SectionCard>
  );
}
