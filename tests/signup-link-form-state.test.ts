import { formStateToPayload, initialFormState } from "@/components/signup-links/form/use-signup-link-form";
import type { SignupLink } from "@/lib/signup-links/types";

function makeLink(overrides: Partial<SignupLink> = {}): SignupLink {
  return {
    uuid: "u-1",
    code: "abc",
    title: "Test",
    enabled: true,
    expires_on: null,
    max_uses: null,
    uses_count: 0,
    consumed_count: 0,
    premium_until: null,
    feature_flags: [],
    analytics_tags: [],
    skip_email_confirmation: false,
    skip_welcome_email: false,
    workshop_onboarding: false,
    welcome_page_title: null,
    welcome_page_body: null,
    expired: false,
    exhausted: false,
    usable: true,
    ...overrides
  };
}

describe("initialFormState", () => {
  test("returns sensible defaults when no link given", () => {
    const state = initialFormState(null);
    expect(state.title).toBe("");
    expect(state.code).toBe("");
    expect(state.enabled).toBe(true);
    expect(state.welcome_page_enabled).toBe(false);
  });

  test("hydrates from an existing link", () => {
    const link = makeLink({
      title: "Beta",
      code: "beta123",
      enabled: false,
      expires_on: "2026-12-31",
      max_uses: 50,
      analytics_tags: ["alpha"]
    });
    const state = initialFormState(link);
    expect(state.title).toBe("Beta");
    expect(state.code).toBe("beta123");
    expect(state.enabled).toBe(false);
    expect(state.expires_on).toBe("2026-12-31");
    expect(state.max_uses).toBe("50");
    expect(state.analytics_tags).toEqual(["alpha"]);
  });

  test("welcome_page_enabled is true only when both title and body are set", () => {
    expect(
      initialFormState(makeLink({ welcome_page_title: "Hi", welcome_page_body: "Body" })).welcome_page_enabled
    ).toBe(true);
    expect(initialFormState(makeLink({ welcome_page_title: "Hi", welcome_page_body: null })).welcome_page_enabled).toBe(
      false
    );
    expect(
      initialFormState(makeLink({ welcome_page_title: null, welcome_page_body: "Body" })).welcome_page_enabled
    ).toBe(false);
  });
});

describe("formStateToPayload", () => {
  test("includes code only when includeCode is true", () => {
    const state = initialFormState(null);
    state.title = "T";
    state.code = "  custom  ";
    const withCode = formStateToPayload(state, true);
    expect(withCode.code).toBe("custom");
    const withoutCode = formStateToPayload(state, false);
    expect(withoutCode.code).toBeUndefined();
  });

  test("blank code on create is omitted (server auto-generates)", () => {
    const state = initialFormState(null);
    state.title = "T";
    state.code = "";
    const payload = formStateToPayload(state, true);
    expect(payload.code).toBeUndefined();
  });

  test("empty max_uses becomes null", () => {
    const state = initialFormState(null);
    state.title = "T";
    const payload = formStateToPayload(state, true);
    expect(payload.max_uses).toBeNull();
  });

  test("welcome_page fields are nulled when disabled, even if title/body have values", () => {
    const state = initialFormState(null);
    state.title = "T";
    state.welcome_page_title = "leftover";
    state.welcome_page_body = "leftover";
    state.welcome_page_enabled = false;
    const payload = formStateToPayload(state, true);
    expect(payload.welcome_page_title).toBeNull();
    expect(payload.welcome_page_body).toBeNull();
  });

  test("welcome_page fields are sent when enabled and non-empty", () => {
    const state = initialFormState(null);
    state.title = "T";
    state.welcome_page_enabled = true;
    state.welcome_page_title = "Welcome";
    state.welcome_page_body = "Body markdown";
    const payload = formStateToPayload(state, true);
    expect(payload.welcome_page_title).toBe("Welcome");
    expect(payload.welcome_page_body).toBe("Body markdown");
  });

  test("feature_flags and analytics_tags pass through unchanged", () => {
    const state = initialFormState(null);
    state.title = "T";
    state.feature_flags = ["a", "b"];
    state.analytics_tags = ["x"];
    const payload = formStateToPayload(state, true);
    expect(payload.feature_flags).toEqual(["a", "b"]);
    expect(payload.analytics_tags).toEqual(["x"]);
  });

  test("empty expires_on becomes null", () => {
    const state = initialFormState(null);
    state.title = "T";
    state.expires_on = "";
    expect(formStateToPayload(state, true).expires_on).toBeNull();
  });

  test("expires_on passes the date string through verbatim", () => {
    const state = initialFormState(null);
    state.title = "T";
    state.expires_on = "2027-06-15";
    expect(formStateToPayload(state, true).expires_on).toBe("2027-06-15");
  });

  test("empty premium_until becomes null", () => {
    const state = initialFormState(null);
    state.title = "T";
    state.premium_until = "";
    expect(formStateToPayload(state, true).premium_until).toBeNull();
  });

  test("non-empty premium_until is converted to an ISO timestamp", () => {
    const state = initialFormState(null);
    state.title = "T";
    state.premium_until = "2027-01-01T00:00";
    const payload = formStateToPayload(state, true);
    expect(typeof payload.premium_until).toBe("string");
    expect(payload.premium_until).toMatch(/T\d{2}:\d{2}:\d{2}/);
  });

  test("skip_email_confirmation and skip_welcome_email are passed through", () => {
    const state = initialFormState(null);
    state.title = "T";
    state.skip_email_confirmation = true;
    state.skip_welcome_email = true;
    const payload = formStateToPayload(state, true);
    expect(payload.skip_email_confirmation).toBe(true);
    expect(payload.skip_welcome_email).toBe(true);
  });

  test("workshop_onboarding is passed through", () => {
    const state = initialFormState(null);
    state.title = "T";
    state.workshop_onboarding = true;
    const payload = formStateToPayload(state, true);
    expect(payload.workshop_onboarding).toBe(true);
  });
});
