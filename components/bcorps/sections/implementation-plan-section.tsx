"use client";

import type { FieldGetter, FieldHint, FieldSetter } from "@/components/bcorps/form-types";
import { ProseEditor } from "@/components/bcorps/prose-editor";
import { FieldGroup } from "@/components/bcorps/ui/field-group";
import { SectionCard } from "@/components/bcorps/ui/section-card";

export function ImplementationPlanSection({ get, set, hint }: { get: FieldGetter; set: FieldSetter; hint: FieldHint }) {
  return (
    <SectionCard title="Implementation Plan">
      <FieldGroup
        label="Actions Overview"
        description="AI-generated summary of climate actions across scopes."
        {...hint("actions_overview")}
      >
        <ProseEditor
          rows={5}
          value={get("actions_overview")}
          onChange={(v) => set("actions_overview", v)}
          placeholder="AI will generate an overview of actions…"
        />
      </FieldGroup>
    </SectionCard>
  );
}
