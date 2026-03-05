"use client";

import type { FieldGetter, FieldHint, FieldSetter } from "@/components/bcorps/form-types";
import { ProseEditor } from "@/components/bcorps/prose-editor";
import { TextareaSection } from "@/components/bcorps/ui/field-group";
import { SectionCard } from "@/components/bcorps/ui/section-card";

export function IntroductionSection({ get, set, hint }: { get: FieldGetter; set: FieldSetter; hint: FieldHint }) {
  return (
    <SectionCard title="Introduction">
      <TextareaSection label="Company Description" {...hint("company_description")}>
        <ProseEditor
          rows={4}
          value={get("company_description")}
          onChange={(v) => set("company_description", v)}
          placeholder="Describe the company…"
        />
      </TextareaSection>
    </SectionCard>
  );
}
