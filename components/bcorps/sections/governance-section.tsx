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
    <section className="space-y-2">
      <h3 className="text-base font-semibold">Governance</h3>
      <p className="text-xs text-muted-foreground">
        Pre-populated intro text. Leave empty to omit this section from the PDF.
      </p>
      <ProseEditor rows={3} value={get("government")} onChange={(v) => set("government", v)} />
      {orderedCats.length > 0 && (
        <div className="space-y-3 pt-1">
          {orderedCats.map((cat) => (
            <div key={cat} className="space-y-1.5">
              <h4 className="text-sm font-semibold">{cat} Actions</h4>
              <ul className="bcorp-list">
                {byCategory[cat].map((a) => (
                  <li key={a.external_action_id}>{a.tal_action.title}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
