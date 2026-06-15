import { useState } from "react";
import type { SignupLink, SignupLinkPayload } from "@/lib/signup-links/types";

export type SignupLinkFormState = {
  title: string;
  code: string;
  enabled: boolean;
  expires_on: string;
  max_uses: string;
  premium_until: string;
  feature_flags: string[];
  analytics_tags: string[];
  skip_email_confirmation: boolean;
  skip_welcome_email: boolean;
  welcome_page_enabled: boolean;
  welcome_page_title: string;
  welcome_page_body: string;
};

function isoToDate(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function isoToDateTimeLocal(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function initialFormState(link: SignupLink | null): SignupLinkFormState {
  if (!link) {
    return {
      title: "",
      code: "",
      enabled: true,
      expires_on: "",
      max_uses: "",
      premium_until: "",
      feature_flags: [],
      analytics_tags: [],
      skip_email_confirmation: false,
      skip_welcome_email: false,
      welcome_page_enabled: false,
      welcome_page_title: "",
      welcome_page_body: ""
    };
  }
  return {
    title: link.title,
    code: link.code,
    enabled: link.enabled,
    expires_on: isoToDate(link.expires_on),
    max_uses: link.max_uses === null ? "" : String(link.max_uses),
    premium_until: isoToDateTimeLocal(link.premium_until),
    feature_flags: link.feature_flags ?? [],
    analytics_tags: link.analytics_tags ?? [],
    skip_email_confirmation: link.skip_email_confirmation,
    skip_welcome_email: link.skip_welcome_email,
    welcome_page_enabled: !!(link.welcome_page_title && link.welcome_page_body),
    welcome_page_title: link.welcome_page_title ?? "",
    welcome_page_body: link.welcome_page_body ?? ""
  };
}

export function formStateToPayload(state: SignupLinkFormState, includeCode: boolean): SignupLinkPayload {
  const payload: SignupLinkPayload = {
    title: state.title.trim(),
    enabled: state.enabled,
    expires_on: state.expires_on || null,
    max_uses: state.max_uses === "" ? null : Number(state.max_uses),
    premium_until: state.premium_until ? new Date(state.premium_until).toISOString() : null,
    feature_flags: state.feature_flags,
    analytics_tags: state.analytics_tags,
    skip_email_confirmation: state.skip_email_confirmation,
    skip_welcome_email: state.skip_welcome_email,
    welcome_page_title: state.welcome_page_enabled ? state.welcome_page_title.trim() || null : null,
    welcome_page_body: state.welcome_page_enabled ? state.welcome_page_body.trim() || null : null
  };
  if (includeCode && state.code.trim()) {
    payload.code = state.code.trim();
  }
  return payload;
}

export function useSignupLinkForm(link: SignupLink | null) {
  const [state, setState] = useState<SignupLinkFormState>(() => initialFormState(link));
  function update<K extends keyof SignupLinkFormState>(key: K, value: SignupLinkFormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }
  return { state, setState, update };
}
