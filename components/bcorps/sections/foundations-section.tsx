"use client";

import type { FieldGetter, FieldHint, FieldSetter } from "@/components/bcorps/form-types";
import { ProseEditor } from "@/components/bcorps/prose-editor";
import { FieldGroup } from "@/components/bcorps/ui/field-group";
import { SectionCard } from "@/components/bcorps/ui/section-card";

export function FoundationsSection({ get, set, hint }: { get: FieldGetter; set: FieldSetter; hint: FieldHint }) {
  return (
    <SectionCard title="Foundations">
      <FieldGroup label="Our Commitment" {...hint("our_commitment")}>
        <ProseEditor rows={3} value={get("our_commitment")} onChange={(v) => set("our_commitment", v)} />
      </FieldGroup>
      <FieldGroup label="Why This Matters for Our Planet" {...hint("why_planet")}>
        <ProseEditor rows={4} value={get("why_planet")} onChange={(v) => set("why_planet", v)} />
      </FieldGroup>
      <FieldGroup label="Why This Matters for Our Business" {...hint("why_business")}>
        <ProseEditor rows={4} value={get("why_business")} onChange={(v) => set("why_business", v)} />
      </FieldGroup>
    </SectionCard>
  );
}
