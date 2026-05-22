"use client";

import { buildSankeyLayout } from "@/components/analytics/actions/funnel/sankey-layout";
import { SankeyLinkPath } from "@/components/analytics/actions/funnel/sankey-link";
import { SankeyNodeShape } from "@/components/analytics/actions/funnel/sankey-node";
import type { ActionFunnel } from "@/lib/analytics/actions-api";

type Props = {
  data: ActionFunnel;
  height?: number;
};

const WIDTH = 800;
const VERTICAL_PADDING = 16;

export function FunnelSankey({ data, height = 420 }: Props) {
  const layout = buildSankeyLayout({ data, width: WIDTH, height, verticalPadding: VERTICAL_PADDING });

  if (!layout) {
    return <div className="text-sm text-muted-foreground">No funnel data in this range.</div>;
  }

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
          {layout.links.map((link, i) => (
            <SankeyLinkPath
              key={`${(link.source as { id: string }).id}-${(link.target as { id: string }).id}-${i}`}
              link={link}
              totalCreated={data.kpis.created}
            />
          ))}
        </g>
        <g>
          {layout.nodes.map((node) => (
            <SankeyNodeShape key={node.id} node={node} chartWidth={WIDTH} />
          ))}
        </g>
      </svg>
    </div>
  );
}
