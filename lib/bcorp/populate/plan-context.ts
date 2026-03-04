import type { Plan, PlanAction } from "@/lib/bcorp/types";

function formatActionBlock(a: PlanAction): string {
  const parts = [`- Title: ${a.tal_action.title}`];
  if (a.tal_action.themes?.length) parts.push(`  Themes: ${a.tal_action.themes.join(", ")}`);
  if (a.tal_action.ghg_category?.length) parts.push(`  GHG Categories: ${a.tal_action.ghg_category.join(", ")}`);
  if (a.tal_action.benefits) parts.push(`  Benefits: ${a.tal_action.benefits}`);
  return parts.join("\n");
}

export function buildActionsOverviewContext(plan: Plan): string {
  const scope12: PlanAction[] = [];
  const scope3: PlanAction[] = [];

  for (const a of plan) {
    const scopes = a.tal_action.ghg_scope ?? [];
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
