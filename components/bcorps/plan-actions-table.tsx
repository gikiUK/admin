"use client";

import { useBcorpHeader } from "@/lib/bcorp/bcorp-header-context";
import type { Plan } from "@/lib/bcorp/types";

function ActionsGroup({ actions, title }: { actions: Plan; title: string }) {
  if (actions.length === 0) return null;
  return (
    <div className="bcorp-list-section">
      <h4>{title}</h4>
      <ul>
        {actions.map((a) => (
          <li key={a.external_action_id}>{a.tal_action.title}</li>
        ))}
      </ul>
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
    <>
      <ActionsGroup actions={scope12} title="Scope 1 & 2 - Direct Emissions & Electricity" />
      <ActionsGroup actions={scope3} title="Scope 3 - Value Chain" />
    </>
  );
}
