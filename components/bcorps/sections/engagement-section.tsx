"use client";

import type { FieldGetter, FieldSetter } from "@/components/bcorps/form-types";
import { ProseEditor } from "@/components/bcorps/prose-editor";
import type { PlanAction } from "@/lib/bcorp/types";

export function EngagementSection({
  get,
  set,
  actions
}: {
  get: FieldGetter;
  set: FieldSetter;
  actions: PlanAction[];
}) {
  if (!get("engagement")) return null;
  return (
    <section className="space-y-2">
      <h3 className="text-base font-semibold">Engagement</h3>
      {actions.length === 0 ? (
        <p className="text-xs text-muted-foreground">No engagement actions were chosen</p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Pre-populated intro text. Leave empty to omit this section from the PDF.
          </p>
          <ProseEditor rows={3} value={get("engagement")} onChange={(v) => set("engagement", v)} />
          <ul className="bcorp-list">
            {actions.map((a) => (
              <li key={a.tal_action.title}>{a.tal_action.title}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
