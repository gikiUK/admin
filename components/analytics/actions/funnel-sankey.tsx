"use client";

import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { useMemo } from "react";
import type { ActionFunnel, FunnelNode, FunnelNodeId } from "@/lib/analytics/actions-api";

type Props = {
  data: ActionFunnel;
  height?: number;
};

const NODE_COLORS: Record<FunnelNodeId, string> = {
  created: "var(--primary)",
  in_progress: "hsl(220, 70%, 55%)",
  active: "hsl(220, 60%, 60%)",
  completed: "hsl(140, 60%, 40%)",
  archived: "hsl(35, 70%, 50%)",
  rejected: "hsl(0, 65%, 55%)",
  deleted: "hsl(0, 50%, 45%)",
  stale: "hsl(20, 60%, 50%)",
  not_progressed: "hsl(220, 8%, 55%)"
};

type SankeyNodeDatum = FunnelNode;
type SankeyLinkDatum = { source: FunnelNodeId; target: FunnelNodeId; value: number };

const WIDTH = 800;
const VERTICAL_PADDING = 16;

export function FunnelSankey({ data, height = 420 }: Props) {
  const layout = useMemo(() => {
    const usedIds = new Set<FunnelNodeId>();
    for (const edge of data.edges) {
      if (edge.count > 0) {
        usedIds.add(edge.from);
        usedIds.add(edge.to);
      }
    }

    const nodes: SankeyNodeDatum[] = data.nodes.filter((n) => usedIds.has(n.id));
    const links: SankeyLinkDatum[] = data.edges
      .filter((edge) => edge.count > 0)
      .map((edge) => ({ source: edge.from, target: edge.to, value: edge.count }));

    if (nodes.length === 0 || links.length === 0) return null;

    const sankeyGenerator = sankey<SankeyNodeDatum, SankeyLinkDatum>()
      .nodeId((node) => node.id)
      .nodeWidth(14)
      .nodePadding(18)
      .extent([
        [8, VERTICAL_PADDING],
        [WIDTH - 120, height - VERTICAL_PADDING]
      ]);

    return sankeyGenerator({
      nodes: nodes.map((n) => ({ ...n })),
      links: links.map((l) => ({ ...l }))
    });
  }, [data, height]);

  if (!layout) {
    return <div className="text-sm text-muted-foreground">No funnel data in this range.</div>;
  }

  const linkPath = sankeyLinkHorizontal<SankeyNodeDatum, SankeyLinkDatum>();
  const totalCreated = data.kpis.created;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        preserveAspectRatio="xMinYMid meet"
        className="w-full"
        style={{ height, minWidth: 600 }}
        role="img"
        aria-label="Action lifecycle Sankey diagram"
      >
        <title>Action lifecycle Sankey diagram</title>
        <g>
          {layout.links.map((link, i) => {
            const pct = totalCreated > 0 ? ((link.value / totalCreated) * 100).toFixed(0) : "0";
            const source = link.source as SankeyNodeDatum;
            const target = link.target as SankeyNodeDatum;
            const path = linkPath(link);
            if (!path) return null;
            return (
              <path
                key={`${source.id}-${target.id}-${i}`}
                d={path}
                fill="none"
                stroke={NODE_COLORS[target.id]}
                strokeOpacity={0.32}
                strokeWidth={Math.max(1, link.width ?? 1)}
              >
                <title>{`${source.label} → ${target.label}: ${link.value} (${pct}% of created)`}</title>
              </path>
            );
          })}
        </g>
        <g>
          {layout.nodes.map((node) => {
            const x0 = node.x0 ?? 0;
            const x1 = node.x1 ?? 0;
            const y0 = node.y0 ?? 0;
            const y1 = node.y1 ?? 0;
            const isRight = x0 > WIDTH / 2;
            return (
              <g key={node.id}>
                <rect x={x0} y={y0} width={x1 - x0} height={Math.max(1, y1 - y0)} fill={NODE_COLORS[node.id]} rx={2} />
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
          })}
        </g>
      </svg>
    </div>
  );
}
