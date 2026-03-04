"use client";

import { useBcorpHeader } from "@/lib/bcorp/bcorp-header-context";
import type { Plan, PlanAction } from "@/lib/bcorp/types";

function ActionRow({ action }: { action: PlanAction }) {
  const ghgCategories = action.tal_action.ghg_category ?? [];
  return (
    <tr className="border-t">
      <td className="py-2 pr-4 text-sm align-top">{action.tal_action.title}</td>
      <td className="py-2 text-sm align-top text-muted-foreground">{ghgCategories.join(", ") || "—"}</td>
    </tr>
  );
}

function ActionsTable({ actions, title }: { actions: Plan; title: string }) {
  if (actions.length === 0) return null;
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Title
            </th>
            <th className="pb-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              GHG Category
            </th>
          </tr>
        </thead>
        <tbody>
          {actions.map((a) => (
            <ActionRow key={a.external_action_id} action={a} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PlanActionsTables() {
  const { plan } = useBcorpHeader();

  const scope12 = plan.filter((a) =>
    (a.tal_action.ghg_scope ?? []).some((s) => s.startsWith("Scope 1") || s.startsWith("Scope 2"))
  );
  const scope3 = plan.filter((a) => (a.tal_action.ghg_scope ?? []).some((s) => s.startsWith("Scope 3")));

  if (scope12.length === 0 && scope3.length === 0) return null;

  return (
    <div className="rounded-md border p-4 space-y-6">
      <ActionsTable actions={scope12} title="Scope 1 & 2 — Direct Emissions & Electricity" />
      <ActionsTable actions={scope3} title="Scope 3 — Value Chain" />
    </div>
  );
}
