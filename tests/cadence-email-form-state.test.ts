import { changedFields, initialFormState, validate } from "@/components/cadence-emails/form/use-cadence-email-form";
import type { CadenceEmail } from "@/lib/cadence-emails/types";

const EMAIL: CadenceEmail = {
  key: "plan_guidance_premium",
  cadence_key: "plan_guidance",
  position: 5,
  subject: "Give your Climate Action Plan a boost",
  preview_text: "Templates, implementation plans and business cases",
  body_markdown: "Do you need an implementation plan?",
  cta_text: "Explore Premium",
  cta_path: "/settings/subscription",
  enabled: true,
  rules: []
};

describe("changedFields", () => {
  it("sends nothing when nothing changed", () => {
    expect(changedFields(initialFormState(EMAIL), EMAIL)).toEqual({});
  });

  it("sends only the fields that differ", () => {
    const state = { ...initialFormState(EMAIL), subject: "New subject", enabled: false };
    expect(changedFields(state, EMAIL)).toEqual({ subject: "New subject", enabled: false });
  });

  it("ignores whitespace-only edits to trimmed fields", () => {
    const state = { ...initialFormState(EMAIL), subject: "  Give your Climate Action Plan a boost  " };
    expect(changedFields(state, EMAIL)).toEqual({});
  });
});

describe("validate", () => {
  it("accepts the loaded email as-is", () => {
    expect(validate(initialFormState(EMAIL))).toEqual({});
  });

  it("requires a subject", () => {
    const issues = validate({ ...initialFormState(EMAIL), subject: "   " });
    expect(issues.subject).toBeDefined();
  });
});
