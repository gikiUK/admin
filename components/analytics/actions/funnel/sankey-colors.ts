import type { FunnelNodeId } from "@/lib/analytics/actions-api";

export const SANKEY_NODE_COLORS: Record<FunnelNodeId, string> = {
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
