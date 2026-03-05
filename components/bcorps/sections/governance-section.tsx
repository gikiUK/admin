"use client";

import type { FieldGetter, FieldSetter } from "@/components/bcorps/form-types";
import { ProseEditor } from "@/components/bcorps/prose-editor";
import { GOVERNANCE_CATEGORIES } from "@/components/bcorps/use-bcorp-form";
import type { PlanAction } from "@/lib/bcorp/types";

export function GovernanceSection({
  get,
  set,
  actions
}: {
  get: FieldGetter;
  set: FieldSetter;
  actions: PlanAction[];
}) {
  if (!get("government")) return null;

  const byCategory: Record<string, PlanAction[]> = {};
  for (const a of actions) {
    const cats = (a.tal_action.ghg_category ?? []).filter((c) => GOVERNANCE_CATEGORIES.includes(c));
    const assigned = cats.length > 0 ? cats : ["Other"];
    for (const cat of assigned) {
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(a);
    }
  }
  const orderedCats = [...GOVERNANCE_CATEGORIES, "Other"].filter((c) => byCategory[c]);

  return (
    <section>
      <h3>Governance</h3>
      {actions.length === 0 ? (
        <p className="text-[18px] text-muted-foreground">No governance actions were chosen.</p>
      ) : (
        <>
          <div className="textarea-section">
            <div className="textarea-header">
              <span>Introduction Paragraph</span>
            </div>
            <div className="textarea-body">
              <ProseEditor rows={3} value={get("government")} onChange={(v) => set("government", v)} />
            </div>
          </div>
          {orderedCats.map((cat) => (
            <div key={cat} className="bcorp-list-section">
              <h4>{cat} Actions</h4>
              <ul>
                {byCategory[cat].map((a) => (
                  <li key={a.external_action_id}>{a.tal_action.title}</li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
