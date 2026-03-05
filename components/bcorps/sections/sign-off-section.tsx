import type { FieldGetter, FieldHint, FieldSetter } from "@/components/bcorps/form-types";
import { TextareaSection } from "@/components/bcorps/ui/field-group";
import { SectionCard } from "@/components/bcorps/ui/section-card";
import { Input } from "@/components/ui/input";

export function SignOffSection({ get, set, hint }: { get: FieldGetter; set: FieldSetter; hint: FieldHint }) {
  return (
    <SectionCard title="Sign Off">
      <TextareaSection
        label="Approval Authority"
        description="Board / Directors / Trustees / Executive Committee"
        {...hint("approval_authority")}
      >
        <Input value={get("approval_authority")} onChange={(e) => set("approval_authority", e.target.value)} />
      </TextareaSection>
      <TextareaSection label="Approval Date" {...hint("approval_date")}>
        <Input type="date" value={get("approval_date")} onChange={(e) => set("approval_date", e.target.value)} />
      </TextareaSection>
      <TextareaSection
        label="Review Date"
        description="Next review date (max 36 months from approval)"
        {...hint("review_date")}
      >
        <Input type="date" value={get("review_date")} onChange={(e) => set("review_date", e.target.value)} />
      </TextareaSection>
    </SectionCard>
  );
}
