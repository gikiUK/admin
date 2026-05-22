export type EngagementAxis = "assignee_coverage" | "due_date_coverage" | "notes_coverage";

export const ENGAGEMENT_AXIS_LABELS: Record<EngagementAxis, string> = {
  assignee_coverage: "Assignee coverage",
  due_date_coverage: "Due-date coverage",
  notes_coverage: "Notes coverage"
};

export type EngagementPoint = {
  x: number;
  y: number;
  size: number;
  title: string;
  adoption_count: number;
  completion_count: number;
  coverage: number;
  completion_rate: number;
  action_id: number;
  action_type: string;
};
