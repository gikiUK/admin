"use client";

import type { FieldGetter, FieldSetter } from "@/components/bcorps/form-types";
import { ProseEditor } from "@/components/bcorps/prose-editor";
import { Badge } from "@/components/ui/badge";
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
      <p className="text-xs text-muted-foreground">
        Pre-populated intro text. Leave empty to omit this section from the PDF.
      </p>
      <ProseEditor rows={3} value={get("engagement")} onChange={(v) => set("engagement", v)} />
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {actions.map((a) => (
            <Badge key={a.external_action_id} variant="secondary">
              {a.tal_action.title}
            </Badge>
          ))}
        </div>
      )}
    </section>
  );
}
