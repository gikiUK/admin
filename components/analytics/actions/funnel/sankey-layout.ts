import { sankey } from "d3-sankey";
import type { ActionFunnel, FunnelNode, FunnelNodeId } from "@/lib/analytics/actions-api";

export type SankeyNodeDatum = FunnelNode;
export type SankeyLinkDatum = { source: FunnelNodeId; target: FunnelNodeId; value: number };

type Params = {
  data: ActionFunnel;
  width: number;
  height: number;
  verticalPadding: number;
};

export function buildSankeyLayout({ data, width, height, verticalPadding }: Params) {
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

  const generator = sankey<SankeyNodeDatum, SankeyLinkDatum>()
    .nodeId((node) => node.id)
    .nodeWidth(14)
    .nodePadding(18)
    .extent([
      [8, verticalPadding],
      [width - 120, height - verticalPadding]
    ]);

  return generator({
    nodes: nodes.map((n) => ({ ...n })),
    links: links.map((l) => ({ ...l }))
  });
}
