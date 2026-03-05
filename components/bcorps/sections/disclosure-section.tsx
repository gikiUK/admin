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
    <section>
      <h3>Performance Reporting &amp; Public Disclosure</h3>
      <div className="textarea-section">
        <div className="textarea-header">
          <span>Intro Paragraph</span>
          <aside>shown before the disclosure actions list</aside>
        </div>
        <div className="textarea-body">
          <ProseEditor rows={3} value={get("disclosure_intro")} onChange={(v) => set("disclosure_intro", v)} />
        </div>
      </div>
      {actions.length > 0 && (
        <div className="bcorp-list-section">
          <div>
            <h4>Actions</h4>
            <ul>
              {actions.map((a) => (
                <li key={a.tal_action.title}>{a.tal_action.title}</li>
              ))}
            </ul>
          </div>
        </div>
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
      <div className="textarea-section">
        <div className="textarea-header">
          <span>Closing Paragraph</span>
          <aside>shown after the actions and certifications</aside>
        </div>
        <div className="textarea-body">
          <ProseEditor rows={3} value={get("disclosure_closing")} onChange={(v) => set("disclosure_closing", v)} />
        </div>
      </div>
    </section>
  );
}
