"use client";

import type { SankeyNode } from "d3-sankey";
import { SANKEY_NODE_COLORS } from "@/components/analytics/actions/funnel/sankey-colors";
import type { SankeyLinkDatum, SankeyNodeDatum } from "@/components/analytics/actions/funnel/sankey-layout";

type Props = {
  node: SankeyNode<SankeyNodeDatum, SankeyLinkDatum>;
  chartWidth: number;
};

export function SankeyNodeShape({ node, chartWidth }: Props) {
  const x0 = node.x0 ?? 0;
  const x1 = node.x1 ?? 0;
  const y0 = node.y0 ?? 0;
  const y1 = node.y1 ?? 0;
  const isRight = x0 > chartWidth / 2;

  return (
    <g>
      <rect x={x0} y={y0} width={x1 - x0} height={Math.max(1, y1 - y0)} fill={SANKEY_NODE_COLORS[node.id]} rx={2} />
      <text
        x={isRight ? x0 - 8 : x1 + 8}
        y={(y0 + y1) / 2}
        dy="0.32em"
        textAnchor={isRight ? "end" : "start"}
        fontSize={12}
        fill="var(--foreground)"
      >
        {node.label}
        <tspan fill="var(--muted-foreground)" dx={6} fontSize={11}>
          {node.value ?? 0}
        </tspan>
      </text>
    </g>
  );
}
