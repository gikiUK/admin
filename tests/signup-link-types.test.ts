import { type SignupLink, signupLinkStatus } from "@/lib/signup-links/types";

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

describe("signupLinkStatus", () => {
  test("returns 'disabled' when enabled is false (even if also expired)", () => {
    expect(signupLinkStatus(makeLink({ enabled: false, expired: true }))).toBe("disabled");
  });

  test("returns 'expired' when enabled but expired", () => {
    expect(signupLinkStatus(makeLink({ expired: true }))).toBe("expired");
  });

  test("returns 'exhausted' when enabled, not expired, but exhausted", () => {
    expect(signupLinkStatus(makeLink({ exhausted: true }))).toBe("exhausted");
  });

  test("returns 'active' when enabled, not expired, not exhausted", () => {
    expect(signupLinkStatus(makeLink())).toBe("active");
  });
});
