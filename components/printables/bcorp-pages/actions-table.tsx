import type { BcorpPageProps } from "@/components/printables/bcorp-printable-page";
import { ScopeLabel } from "@/components/printables/scope-labels";
import type { PlanAction } from "@/lib/bcorp/types";

function getScopeNumbers(action: PlanAction): (1 | 2 | 3)[] {
  return (action.tal_action.ghg_scope ?? [])
    .map((s) => {
      const match = s.match(/^Scope (\d)/);
      return match ? (Number.parseInt(match[1]) as 1 | 2 | 3) : null;
    })
    .filter((n): n is 1 | 2 | 3 => n !== null);
}

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
  const scopes = getScopeNumbers(action);
  const ghgCategories = action.tal_action.ghg_category ?? [];

  return (
    <tr>
      <td>{action.tal_action.title}</td>
      <td>
        {scopes.map((s) => (
          <ScopeLabel key={s} scope={s} />
        ))}
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

export function ActionsTable({ plan }: BcorpPageProps) {
  const scope12Actions = plan.filter((a) =>
    (a.tal_action.ghg_scope ?? []).some((s) => s.startsWith("Scope 1") || s.startsWith("Scope 2"))
  );
  const scope3Actions = plan.filter((a) => (a.tal_action.ghg_scope ?? []).some((s) => s.startsWith("Scope 3")));

  return (
    <div className="ui-page">
      <div className="ui-section">
        <h3>Actions for Direct Emissions &amp; Electricity</h3>
        <p className="scope-subtitle">Scope 1 &amp; 2 Emissions Actions</p>
        <table className="action-table">
          <thead>
            <tr>
              <th className="col-title">Title</th>
              <th className="col-scope">Scope</th>
              <th className="col-ghg">GHG Category</th>
            </tr>
          </thead>
          <tbody>
            {scope12Actions.map((action) => (
              <ActionRow key={action.external_action_id} action={action} />
            ))}
          </tbody>
        </table>

        <h3>Actions for our Value Chain</h3>
        <p className="scope-subtitle">Scope 3 Emissions Actions</p>
        <table className="action-table">
          <thead>
            <tr>
              <th className="col-title">Title</th>
              <th className="col-scope">Scope</th>
              <th className="col-ghg">GHG Category</th>
            </tr>
          </thead>
          <tbody>
            {scope3Actions.map((action) => (
              <ActionRow key={action.external_action_id} action={action} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
