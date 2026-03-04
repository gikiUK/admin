"use client";

import type { FieldGetter, FieldHint, FieldSetter } from "@/components/bcorps/form-types";
import { ProseEditor } from "@/components/bcorps/prose-editor";
import { FieldGroup } from "@/components/bcorps/ui/field-group";
import { SectionCard } from "@/components/bcorps/ui/section-card";

export function ProgressTrackingSection({ get, set, hint }: { get: FieldGetter; set: FieldSetter; hint: FieldHint }) {
  return (
    <SectionCard title="Progress Tracking">
      <FieldGroup
        label="Actions In Progress"
        description="AI-generated summary of in-progress actions."
        {...hint("actions_in_progress")}
      >
        <ProseEditor
          rows={4}
          value={get("actions_in_progress")}
          onChange={(v) => set("actions_in_progress", v)}
          placeholder="AI will summarise in-progress actions…"
        />
      </FieldGroup>
      <FieldGroup
        label="Actions Added to Plan"
        description="AI-generated summary of recently added actions."
        {...hint("actions_added")}
      >
        <ProseEditor
          rows={4}
          value={get("actions_added")}
          onChange={(v) => set("actions_added", v)}
          placeholder="AI will summarise actions added to the plan…"
        />
      </FieldGroup>
    </SectionCard>
  );
}
