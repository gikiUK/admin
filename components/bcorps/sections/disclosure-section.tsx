"use client";

import type { FieldGetter, FieldHint, FieldSetter } from "@/components/bcorps/form-types";
import { ProseEditor } from "@/components/bcorps/prose-editor";
import { FieldGroup } from "@/components/bcorps/ui/field-group";
import { YesNoSelect, yesNo } from "@/components/bcorps/ui/yes-no-select";
import { Input } from "@/components/ui/input";
import type { PlanAction } from "@/lib/bcorp/types";

export function DisclosureSection({
  get,
  set,
  hint,
  actions
}: {
  get: FieldGetter;
  set: FieldSetter;
  hint: FieldHint;
  actions: PlanAction[];
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-base font-semibold">Performance Reporting &amp; Public Disclosure</h3>
      <p className="text-xs text-muted-foreground">Intro paragraph shown before the disclosure actions list.</p>
      <ProseEditor rows={3} value={get("disclosure_intro")} onChange={(v) => set("disclosure_intro", v)} />
      {actions.length > 0 && (
        <>
          <h4 className="text-sm font-semibold">Actions</h4>
          <ul className="bcorp-list">
            {actions.map((a) => (
              <li key={a.tal_action.title}>{a.tal_action.title}</li>
            ))}
          </ul>
        </>
      )}
      <FieldGroup label="Reports through CDP" {...hint("reporting_cdp")}>
        <YesNoSelect value={yesNo(get("reporting_cdp"))} onChange={(v) => set("reporting_cdp", v)} />
      </FieldGroup>
      <FieldGroup label="Has an Ecovadis Rating" {...hint("rating_ecovadis")}>
        <YesNoSelect value={yesNo(get("rating_ecovadis"))} onChange={(v) => set("rating_ecovadis", v)} />
      </FieldGroup>
      {get("rating_ecovadis") === "yes" && (
        <FieldGroup label="Ecovadis Rating Level" {...hint("rating_ecovadis_level")}>
          <Input value={get("rating_ecovadis_level")} onChange={(e) => set("rating_ecovadis_level", e.target.value)} />
        </FieldGroup>
      )}
      <p className="text-xs text-muted-foreground">Closing paragraph shown after the actions and certifications.</p>
      <ProseEditor rows={3} value={get("disclosure_closing")} onChange={(v) => set("disclosure_closing", v)} />
    </section>
  );
}
