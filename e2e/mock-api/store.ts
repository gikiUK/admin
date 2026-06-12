/**
 * In-memory backing store for the hermetic mock API. One instance per test.
 *
 * The store models the slice of Rails state the admin UI reaches for during a
 * signup-link round-trip: the link itself, the linked companies, plus the three
 * reference catalogues the form pulls (referrers, feature flags, cohorts).
 *
 * Write operations mirror Rails' `Admin::SignupLinksController` semantics
 * just enough that the UI behaves the same: assign a uuid on create, merge on
 * update, validate referrer existence, etc.
 */
import canonicalJson from "@/e2e/fixtures/signup-link/canonical.json";
import type { TagWithCount } from "@/lib/tags/api";
import type { SignupLink, SignupLinkCompany, SignupLinkPayload } from "./types";

const CANONICAL: SignupLink = canonicalJson as SignupLink;

export type Referrer = { id: number; name: string };

export type StoreSeed = {
  links?: SignupLink[];
  companiesByLink?: Record<string, SignupLinkCompany[]>;
  referrers?: Referrer[];
  featureFlags?: string[];
  cohorts?: TagWithCount[];
  companyTags?: TagWithCount[];
};

export class MockStore {
  links: SignupLink[] = [];
  companies = new Map<string, SignupLinkCompany[]>();
  referrers: Referrer[] = [];
  featureFlags: string[] = [];
  cohorts: TagWithCount[] = [];
  companyTags: TagWithCount[] = [];

  private uuidCounter = 0;

  constructor(seed: StoreSeed = {}) {
    this.links = (seed.links ?? []).map((l) => ({ ...l }));
    if (seed.companiesByLink) {
      for (const [uuid, companies] of Object.entries(seed.companiesByLink)) {
        this.companies.set(uuid, [...companies]);
      }
    }
    this.referrers = seed.referrers ?? [];
    this.featureFlags = seed.featureFlags ?? [];
    this.cohorts = seed.cohorts ?? [];
    this.companyTags = seed.companyTags ?? [];
  }

  nextUuid(): string {
    this.uuidCounter += 1;
    return `mock-uuid-${String(this.uuidCounter).padStart(8, "0")}`;
  }

  find(uuid: string): SignupLink | undefined {
    return this.links.find((l) => l.uuid === uuid);
  }

  create(payload: SignupLinkPayload): SignupLink {
    const referrer = payload.referrer_id ? (this.referrers.find((r) => r.id === payload.referrer_id) ?? null) : null;
    const link: SignupLink = {
      ...CANONICAL,
      uuid: this.nextUuid(),
      code: payload.code ?? `AUTO-${this.uuidCounter}`,
      title: payload.title ?? "",
      enabled: payload.enabled ?? true,
      expires_on: payload.expires_on ?? null,
      max_uses: payload.max_uses ?? null,
      uses_count: 0,
      consumed_count: 0,
      premium_until: payload.premium_until ?? null,
      feature_flags: payload.feature_flags ?? [],
      analytics_tags: payload.analytics_tags ?? [],
      analytics_cohorts: payload.analytics_cohorts ?? [],
      skip_email_confirmation: payload.skip_email_confirmation ?? false,
      skip_welcome_email: payload.skip_welcome_email ?? false,
      welcome_page_title: payload.welcome_page_title ?? null,
      welcome_page_body: payload.welcome_page_body ?? null,
      referrer: referrer ? { id: referrer.id, name: referrer.name } : null,
      expired: false,
      exhausted: false,
      usable: true
    };
    this.links = [link, ...this.links];
    return link;
  }

  update(uuid: string, payload: SignupLinkPayload): SignupLink | undefined {
    const idx = this.links.findIndex((l) => l.uuid === uuid);
    if (idx === -1) return undefined;
    const existing = this.links[idx];
    const referrer =
      "referrer_id" in payload
        ? payload.referrer_id
          ? (this.referrers.find((r) => r.id === payload.referrer_id) ?? null)
          : null
        : existing.referrer;
    const merged: SignupLink = {
      ...existing,
      ...("title" in payload ? { title: payload.title ?? "" } : {}),
      ...("code" in payload ? { code: payload.code ?? existing.code } : {}),
      ...("enabled" in payload ? { enabled: payload.enabled ?? existing.enabled } : {}),
      ...("expires_on" in payload ? { expires_on: payload.expires_on ?? null } : {}),
      ...("max_uses" in payload ? { max_uses: payload.max_uses ?? null } : {}),
      ...("premium_until" in payload ? { premium_until: payload.premium_until ?? null } : {}),
      ...("feature_flags" in payload ? { feature_flags: payload.feature_flags ?? [] } : {}),
      ...("analytics_tags" in payload ? { analytics_tags: payload.analytics_tags ?? [] } : {}),
      ...("analytics_cohorts" in payload ? { analytics_cohorts: payload.analytics_cohorts ?? [] } : {}),
      ...("skip_email_confirmation" in payload
        ? { skip_email_confirmation: payload.skip_email_confirmation ?? false }
        : {}),
      ...("skip_welcome_email" in payload ? { skip_welcome_email: payload.skip_welcome_email ?? false } : {}),
      ...("welcome_page_title" in payload ? { welcome_page_title: payload.welcome_page_title ?? null } : {}),
      ...("welcome_page_body" in payload ? { welcome_page_body: payload.welcome_page_body ?? null } : {}),
      referrer: referrer ? { id: referrer.id, name: referrer.name } : null
    };
    this.links[idx] = merged;
    return merged;
  }

  destroy(uuid: string): boolean {
    const idx = this.links.findIndex((l) => l.uuid === uuid);
    if (idx === -1) return false;
    this.links.splice(idx, 1);
    return true;
  }

  companiesFor(uuid: string): SignupLinkCompany[] {
    return this.companies.get(uuid) ?? [];
  }
}
