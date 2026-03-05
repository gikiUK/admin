import type { BcorpPageProps } from "@/components/printables/bcorp-printable-page";
import { ScopeLabels } from "@/components/printables/scope-labels";
import type { Plan, PlanAction } from "@/lib/bcorp/types";

function ghgCategoryClass(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes("mobile combustion")) return "cat-mobile";
  if (lower.includes("stationary combustion")) return "cat-stationary";
  if (lower.includes("electricity")) return "cat-electricity";
  if (lower.includes("business travel")) return "cat-travel";
  if (lower.includes("purchased goods")) return "cat-purchased";
  if (lower.includes("capital goods")) return "cat-capital";
  if (lower.includes("upstream")) return "cat-transport";
  if (lower.includes("waste")) return "cat-waste";
  if (lower.includes("commuting")) return "cat-commuting";
  if (lower.includes("sold products")) return "cat-sold";
  if (lower.includes("leased assets")) return "cat-transport";
  return "cat-purchased";
}

function ghgDisplayName(category: string): string {
  const match = category.match(/^(?:Cat \d+ - |Scope \d+ - )(.+)$/);
  return match ? match[1] : category;
}

function ActionRow({ action }: { action: PlanAction }) {
  const ghgCategories = action.tal_action.ghg_category ?? [];

  return (
    <tr>
      <td>{action.tal_action.title}</td>
      <td>
        <ScopeLabels ghgScope={action.tal_action.ghg_scope ?? []} />
      </td>
      <td>
        {ghgCategories.map((cat) => (
          <span key={cat} className={`cat ${ghgCategoryClass(cat)}`}>
            {ghgDisplayName(cat)}
          </span>
        ))}
      </td>
    </tr>
  );
}

function ScopedActionsTable({ title, subtitle, actions }: { title: string; subtitle: string; actions: Plan }) {
  if (actions.length === 0) return null;

  return (
    <>
      <h3>{title}</h3>
      <p className="scope-subtitle">{subtitle}</p>
      <table className="action-table">
        <thead>
          <tr>
            <th className="col-title">Title</th>
            <th className="col-scope">Scope</th>
            <th className="col-ghg">GHG Category</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((action) => (
            <ActionRow key={action.external_action_id} action={action} />
          ))}
        </tbody>
      </table>
    </>
  );
}

export function ActionsTable({ plan }: BcorpPageProps) {
  const scope12Actions = plan.filter((a) =>
    (a.tal_action.ghg_scope ?? []).some((s) => s.startsWith("Scope 1") || s.startsWith("Scope 2"))
  );
  const scope3Actions = plan.filter((a) => (a.tal_action.ghg_scope ?? []).some((s) => s.startsWith("Scope 3")));

  if (scope12Actions.length === 0 && scope3Actions.length === 0) return null;

  return (
    <div className="ui-page">
      <div className="ui-section">
        <ScopedActionsTable
          title="Actions for Direct Emissions & Electricity"
          subtitle="Scope 1 & 2 Emissions Actions"
          actions={scope12Actions}
        />
        <ScopedActionsTable
          title="Actions for our Value Chain"
          subtitle="Scope 3 Emissions Actions"
          actions={scope3Actions}
        />
      </div>
    </div>
  );
}
