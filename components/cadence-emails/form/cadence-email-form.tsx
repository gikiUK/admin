"use client";

import { useState } from "react";
import { ContentFields } from "@/components/cadence-emails/form/content-fields";
import { EnabledField } from "@/components/cadence-emails/form/enabled-field";
import { ServerPreview } from "@/components/cadence-emails/form/server-preview";
import {
  changedFields,
  formStateToPayload,
  useCadenceEmailForm,
  validate
} from "@/components/cadence-emails/form/use-cadence-email-form";
import { useUnsavedChangesWarning } from "@/components/cadence-emails/form/use-unsaved-changes-warning";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CadenceEmailError } from "@/lib/cadence-emails/api";
import type { CadenceEmail, CadenceEmailPayload } from "@/lib/cadence-emails/types";

type Props = {
  email: CadenceEmail;
  onSubmit: (payload: CadenceEmailPayload) => Promise<void>;
};

export function CadenceEmailForm({ email, onSubmit }: Props) {
  const { state, update } = useCadenceEmailForm(email);
  const [saving, setSaving] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState("");

  const issues = validate(state);
  const dirty = Object.keys(changedFields(state, email)).length > 0;
  const blocked = Boolean(issues.subject);

  useUnsavedChangesWarning(dirty && !saving, "You have unsaved changes to this email. Leave without saving?");

  function fieldError(field: string, local?: string): string | undefined {
    return local ?? serverErrors[field]?.join(", ");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (blocked) return;
    setSaving(true);
    setServerErrors({});
    setFormError("");
    try {
      await onSubmit(changedFields(state, email));
    } catch (err) {
      if (err instanceof CadenceEmailError) setServerErrors(err.fieldErrors);
      setFormError(err instanceof Error ? err.message : "Could not save this email.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="space-y-5">
        <ContentFields
          subject={state.subject}
          previewText={state.preview_text}
          bodyMarkdown={state.body_markdown}
          errors={{
            subject: fieldError("subject", issues.subject),
            preview_text: fieldError("preview_text"),
            body_markdown: fieldError("body_markdown")
          }}
          onSubjectChange={(v) => update("subject", v)}
          onPreviewTextChange={(v) => update("preview_text", v)}
          onBodyMarkdownChange={(v) => update("body_markdown", v)}
        />

        <Separator />

        <EnabledField enabled={state.enabled} onChange={(v) => update("enabled", v)} />

        {formError && <p className="text-destructive text-sm">{formError}</p>}

        <Button type="submit" disabled={saving || blocked || !dirty}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <div className="lg:sticky lg:top-16">
        <ServerPreview emailKey={email.key} payload={formStateToPayload(state)} />
      </div>
    </form>
  );
}
