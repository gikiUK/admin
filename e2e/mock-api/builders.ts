import canonicalJson from "@/e2e/fixtures/signup-link/canonical.json";
import type { SignupLink, SignupLinkCompany } from "@/lib/signup-links/types";

const CANONICAL: SignupLink = canonicalJson as SignupLink;

/**
 * Build a SignupLink starting from `canonical.json` (mirrors Rails'
 * SerializeSignupLink output) and overlay the overrides on top. Useful for
 * seeding the mock store with variants (expired, exhausted, no welcome page,
 * etc.) without committing a new JSON file for each.
 */
export function buildSignupLink(overrides: Partial<SignupLink> = {}): SignupLink {
  return { ...CANONICAL, ...overrides };
}

let companyIdCounter = 0;

export function buildCompany(overrides: Partial<SignupLinkCompany> = {}): SignupLinkCompany {
  companyIdCounter += 1;
  return {
    id: companyIdCounter,
    slug: `company-${companyIdCounter}`,
    name: `Company ${companyIdCounter}`,
    logo_url: null,
    members_count: 1,
    tracked_actions_count: 0,
    subscription_tier: "standard",
    subscription_status: "active",
    trial_ends_at: null,
    in_trial: false,
    gifted_premium_until: null,
    access_status: "standard",
    analytics_tags: [],
    feature_flags: [],
    created_at: "2026-06-01T12:00:00Z",
    deleted_at: null,
    ...overrides
  };
}

export function resetCompanyIdCounter(): void {
  companyIdCounter = 0;
}
