import { useState } from "react";
import type { CadenceEmail, CadenceEmailPayload } from "@/lib/cadence-emails/types";

export type CadenceEmailFormState = {
  subject: string;
  preview_text: string;
  body_markdown: string;
  enabled: boolean;
};

export function initialFormState(email: CadenceEmail): CadenceEmailFormState {
  return {
    subject: email.subject ?? "",
    preview_text: email.preview_text ?? "",
    body_markdown: email.body_markdown ?? "",
    enabled: email.enabled
  };
}

/** The full set of values, for the preview endpoint — it renders what's on screen, changed or not. */
export function formStateToPayload(state: CadenceEmailFormState): CadenceEmailPayload {
  return {
    subject: state.subject.trim(),
    preview_text: state.preview_text.trim(),
    body_markdown: state.body_markdown,
    enabled: state.enabled
  };
}

/** Only the fields that differ from what was loaded, so an untouched field can't be clobbered. */
export function changedFields(state: CadenceEmailFormState, email: CadenceEmail): CadenceEmailPayload {
  const next = formStateToPayload(state);
  const original = formStateToPayload(initialFormState(email));
  const payload: CadenceEmailPayload = {};
  for (const field of Object.keys(next) as Array<keyof CadenceEmailPayload>) {
    if (next[field] !== original[field]) {
      Object.assign(payload, { [field]: next[field] });
    }
  }
  return payload;
}

export type FormIssues = {
  subject?: string;
};

export function validate(state: CadenceEmailFormState): FormIssues {
  const issues: FormIssues = {};
  if (!state.subject.trim()) issues.subject = "Subject can't be blank.";
  return issues;
}

export function useCadenceEmailForm(email: CadenceEmail) {
  const [state, setState] = useState<CadenceEmailFormState>(() => initialFormState(email));

  function update<K extends keyof CadenceEmailFormState>(key: K, value: CadenceEmailFormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  return { state, setState, update };
}
