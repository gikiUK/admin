"use client";

import type { FieldGetter, FieldSetter } from "@/components/bcorps/form-types";
import { ProseEditor } from "@/components/bcorps/prose-editor";

export function EngagementSection({ get, set }: { get: FieldGetter; set: FieldSetter }) {
  return (
    <section className="space-y-2">
      <h3 className="text-base font-semibold">Engagement</h3>
      <p className="text-xs text-muted-foreground">
        Pre-populated intro text. Leave empty to omit this section from the PDF.
      </p>
      <ProseEditor rows={3} value={get("engagement")} onChange={(v) => set("engagement", v)} />
    </section>
  );
}
