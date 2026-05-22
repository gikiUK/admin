"use client";

import { ForestPlotAxis } from "@/components/analytics/actions/correlations/forest-plot-axis";
import { buildForestScales, FOREST_LAYOUT } from "@/components/analytics/actions/correlations/forest-plot-helpers";
import { ForestPlotRow } from "@/components/analytics/actions/correlations/forest-plot-row";
import type { ActionCorrelationFactor } from "@/lib/analytics/actions-api";

type Props = {
  factors: ActionCorrelationFactor[];
};

export function ForestPlot({ factors }: Props) {
  const scales = buildForestScales(factors);
  const { rowHeight, topPadding, bottomPadding } = FOREST_LAYOUT;
  const height = topPadding + bottomPadding + factors.length * rowHeight;

  if (factors.length === 0) {
    return <div className="text-sm text-muted-foreground">No factors to compare.</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${scales.width} ${height}`}
        preserveAspectRatio="xMinYMid meet"
        className="w-full"
        style={{ height, minWidth: 600 }}
        role="img"
        aria-label="Forest plot of factor lifts on action completion rate"
      >
        <title>Forest plot of factor lifts on action completion rate</title>
        <ForestPlotAxis
          plotLeft={scales.plotLeft}
          plotRight={scales.plotRight}
          rightStrip={scales.rightStrip}
          topPadding={topPadding}
          bottomPadding={bottomPadding}
          height={height}
          domainMin={scales.domainMin}
          domainMax={scales.domainMax}
          xScale={scales.xScale}
        />
        {factors.map((factor, i) => (
          <ForestPlotRow
            key={factor.factor}
            factor={factor}
            y={topPadding + rowHeight * (i + 0.5)}
            plotLeft={scales.plotLeft}
            plotRight={scales.plotRight}
            rightStrip={scales.rightStrip}
            xScale={scales.xScale}
            dotRadius={scales.dotRadius}
          />
        ))}
      </svg>
    </div>
  );
}
