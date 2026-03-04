import type { Plan, PlanAction } from "@/lib/bcorp/types";

function formatActionBlock(a: PlanAction): string {
  const parts = [`- Title: ${a.action_data.title}`];
  if (a.action_data.impact) parts.push(`  Impact: ${a.action_data.impact}`);
  if (a.action_data.groups?.themes?.length) parts.push(`  Themes: ${a.action_data.groups.themes.join(", ")}`);
  if (a.action_data.groups?.ghg_categories?.length)
    parts.push(`  GHG Categories: ${a.action_data.groups.ghg_categories.join(", ")}`);
  if (a.action_data.benefits) parts.push(`  Benefits: ${a.action_data.benefits}`);
  return parts.join("\n");
}

export function buildActionsOverviewContext(plan: Plan): string {
  const scope12: PlanAction[] = [];
  const scope3: PlanAction[] = [];

  for (const a of plan) {
    const scopes = a.action_data.scopes ?? [];
    if (scopes.some((s) => s.startsWith("Scope 1") || s.startsWith("Scope 2"))) scope12.push(a);
    if (scopes.some((s) => s.startsWith("Scope 3"))) scope3.push(a);
  }

  const total = scope12.length + scope3.length;
  const lines = [`Total scoped actions: ${total}`];

  if (scope12.length > 0) {
    lines.push(`\nScope 1 & 2 actions (${scope12.length}):`);
    for (const a of scope12) lines.push(formatActionBlock(a));
  }

  if (scope3.length > 0) {
    lines.push(`\nScope 3 actions (${scope3.length}):`);
    for (const a of scope3) lines.push(formatActionBlock(a));
  }

  return lines.join("\n");
}
