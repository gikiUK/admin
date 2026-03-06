"use client";

import type { FieldGetter, FieldHint, FieldSetter } from "@/components/bcorps/form-types";
import { ProseEditor } from "@/components/bcorps/prose-editor";
import { TextareaSection } from "@/components/bcorps/ui/field-group";
import { ToggleSection } from "@/components/bcorps/ui/toggle-section";
import { toYesNo } from "@/components/bcorps/ui/yes-no-select";
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
      {actions.length === 0 ? (
        <p className="text-[18px] text-muted-foreground">
          No performance reporting &amp; public disclosure actions were chosen.
        </p>
      ) : (
        <>
          <div className="textarea-section">
            <div className="textarea-header">
              <span>Introduction Paragraph</span>
              <aside>shown before the disclosure actions list</aside>
            </div>
            <div className="textarea-body">
              <ProseEditor rows={3} value={get("disclosure_intro")} onChange={(v) => set("disclosure_intro", v)} />
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
          <ToggleSection
            label="Reports through CDP"
            value={get("reporting_cdp") === "yes"}
            onChange={(v) => set("reporting_cdp", toYesNo(v))}
          />
          <ToggleSection
            label="Has an Ecovadis Rating"
            value={get("rating_ecovadis") === "yes"}
            onChange={(v) => set("rating_ecovadis", toYesNo(v))}
          />
          {get("rating_ecovadis") === "yes" && (
            <TextareaSection label="Ecovadis Rating Level" {...hint("rating_ecovadis_level")}>
              <Input
                value={get("rating_ecovadis_level")}
                onChange={(e) => set("rating_ecovadis_level", e.target.value)}
              />
            </TextareaSection>
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
        </>
      )}
    </section>
  );
}
