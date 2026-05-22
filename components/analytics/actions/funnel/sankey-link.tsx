"use client";

import { type SankeyLink, sankeyLinkHorizontal } from "d3-sankey";
import { SANKEY_NODE_COLORS } from "@/components/analytics/actions/funnel/sankey-colors";
import type { SankeyLinkDatum, SankeyNodeDatum } from "@/components/analytics/actions/funnel/sankey-layout";

type Props = {
  link: SankeyLink<SankeyNodeDatum, SankeyLinkDatum>;
  totalCreated: number;
};

const linkPath = sankeyLinkHorizontal<SankeyNodeDatum, SankeyLinkDatum>();

export function SankeyLinkPath({ link, totalCreated }: Props) {
  const source = link.source as SankeyNodeDatum;
  const target = link.target as SankeyNodeDatum;
  const path = linkPath(link);
  if (!path) return null;
  const pct = totalCreated > 0 ? ((link.value / totalCreated) * 100).toFixed(0) : "0";

  return (
    <path
      d={path}
      fill="none"
      stroke={SANKEY_NODE_COLORS[target.id]}
      strokeOpacity={0.32}
      strokeWidth={Math.max(1, link.width ?? 1)}
    >
      <title>{`${source.label} → ${target.label}: ${link.value} (${pct}% of created)`}</title>
    </path>
  );
}
