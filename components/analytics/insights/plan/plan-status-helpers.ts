export const PLAN_STATUS_ORDER = ["not_started", "in_progress", "completed", "archived", "rejected"];

export const PLAN_STATUS_COLOR: Record<string, string> = {
  not_started: "hsl(220, 8%, 55%)",
  in_progress: "hsl(220, 70%, 55%)",
  completed: "hsl(140, 60%, 40%)",
  archived: "hsl(35, 70%, 50%)",
  rejected: "hsl(0, 65%, 55%)"
};

export type PlanStatusRow = {
  status: string;
  label: string;
  count: number;
};

export function buildPlanStatusRows(byStatus: Record<string, number>): PlanStatusRow[] {
  return PLAN_STATUS_ORDER.filter((s) => byStatus[s] !== undefined && byStatus[s] !== null).map((status) => ({
    status,
    label: status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    count: byStatus[status] ?? 0
  }));
}
