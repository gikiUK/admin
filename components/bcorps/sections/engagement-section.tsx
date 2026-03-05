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
    <section>
      <h3>Engagement</h3>
      {actions.length === 0 ? (
        <p className="text-[18px] text-muted-foreground">No engagement actions were chosen.</p>
      ) : (
        <>
          <div className="textarea-section">
            <div className="textarea-header">
              <span>Introduction Paragraph</span>
              <aside>leave empty to omit this section from the PDF</aside>
            </div>
            <div className="textarea-body">
              <ProseEditor rows={3} value={get("engagement")} onChange={(v) => set("engagement", v)} />
            </div>
          </div>
          <div className="bcorp-list-section">
            <h4>Actions</h4>
            <ul>
              {actions.map((a) => (
                <li key={a.tal_action.title}>{a.tal_action.title}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}
