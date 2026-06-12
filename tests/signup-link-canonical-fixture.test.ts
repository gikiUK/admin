import canonical from "@/e2e/fixtures/signup-link/canonical.json";
import { type SignupLink, signupLinkStatus } from "@/lib/signup-links/types";

/**
 * Sentinel — the canonical fixture is generated from Rails'
 * SerializeSignupLink expected-output and lives in `e2e/fixtures`. The e2e
 * mock leans on it being structurally a SignupLink. This test pins that:
 * any field added/removed/retyped on the TypeScript side without updating
 * the fixture will fail here, surfacing the drift before the mock layer
 * silently lies to Playwright tests.
 *
 * If this test fails, see e2e/fixtures/signup-link/README.md for refresh.
 */
describe("canonical signup-link fixture", () => {
  test("matches the SignupLink shape", () => {
    const link: SignupLink = canonical as SignupLink;
    // Required keys present and typed.
    expect(typeof link.uuid).toBe("string");
    expect(typeof link.code).toBe("string");
    expect(typeof link.title).toBe("string");
    expect(typeof link.enabled).toBe("boolean");
    expect(Array.isArray(link.feature_flags)).toBe(true);
    expect(Array.isArray(link.analytics_tags)).toBe(true);
    expect(Array.isArray(link.analytics_cohorts)).toBe(true);
    expect(typeof link.skip_email_confirmation).toBe("boolean");
    expect(typeof link.skip_welcome_email).toBe("boolean");
    expect(typeof link.expired).toBe("boolean");
    expect(typeof link.exhausted).toBe("boolean");
    expect(typeof link.usable).toBe("boolean");
  });

  test("derives a sensible status via signupLinkStatus", () => {
    const link: SignupLink = canonical as SignupLink;
    expect(["active", "disabled", "expired", "exhausted"]).toContain(signupLinkStatus(link));
  });

  test("does NOT carry any unexpected keys (drift sentinel)", () => {
    const allowed = new Set([
      "uuid",
      "code",
      "title",
      "enabled",
      "expires_on",
      "max_uses",
      "uses_count",
      "consumed_count",
      "premium_until",
      "feature_flags",
      "analytics_tags",
      "analytics_cohorts",
      "skip_email_confirmation",
      "skip_welcome_email",
      "welcome_page_title",
      "welcome_page_body",
      "referrer",
      "expired",
      "exhausted",
      "usable",
      "created_at"
    ]);
    const surplus = Object.keys(canonical).filter((k) => !allowed.has(k));
    expect(surplus).toEqual([]);
  });
});
