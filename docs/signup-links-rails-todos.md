# Signup-link e2e — Rails-side notes for the API team

Context: we just added Playwright e2e coverage for the admin signup-link
flows (`e2e/specs/*`). The harness is **hermetic** — admin requests are
intercepted by a Playwright mock layer that returns canned JSON shaped like
the real Rails API. No Rails server runs during e2e.

This means the admin-side suite catches:

- Drift in **what the admin UI sends** (request envelope, payload fields).
- Drift in **how the admin UI consumes** the response.

It does NOT catch drift in **what Rails actually emits**. Below are the
things we'd want from the Rails side so the two halves stay in sync, and
two observations from auditing the API while building this.

## 1. Keep `SerializeSignupLink` test as the canonical fixture source

The mock layer is seeded from `e2e/fixtures/signup-link/canonical.json`, which
is a copy of the `expected = { ... }` hash in
`api/test/serializers/serialize_signup_link_test.rb` (the "serializes a
signup link" test). Refresh procedure is in
`e2e/fixtures/signup-link/README.md`.

**Ask**: please don't change the serializer or its shape without
updating that test in the same PR. If you add or rename a field, ping
us so we can refresh the fixture — otherwise the admin-side `SignupLink`
type will drift and the mock will silently lie to the e2e suite.

## 2. Expose Rails permit list as machine-readable shape

`Admin::SignupLinksController#create_params` is the source of truth for the
request envelope (`signup_link: {...}`). Today the admin side encodes this
list independently in `lib/signup-links/types.ts` (`SignupLinkPayload`). If
the permit list grows on the Rails side, our payload tests will keep
passing while live requests silently drop the new field.

**Nice-to-have**: a generated/exported JSON schema of the permit list,
or — equivalent — a quick test in Rails that asserts
`create_params.permit(...)` matches a fixed key list. Then admin can
mirror it.

## 3. Error envelopes — keep the shape stable

The mock returns:

```json
{ "error": { "type": "validation_error", "message": "...", "errors": { "title": ["..."] } } }
```

for 422s, and:

```json
{ "error": { "type": "signup_link_not_found", "message": "Not found" } }
```

for 404s, and:

```json
{ "error": { "type": "signup_link_in_use", "message": "Signup link in use" } }
```

for the destroy-while-in-use 422. The admin UI surfaces `error.message`
verbatim via `ApiError`. If Rails ever changes this envelope (renames
`type`, nests `message` under `error.detail`, etc.) the admin will fall
back to a generic message. Worth keeping these shapes stable, or running
this past us before changing.

## 4. Observations from the audit

These aren't blockers, just things we noticed while writing the e2e:

- **`SerializeAdminCompany#counts` triggers per-row queries when called
  without preloaded counts** (`memoize` on a method that hits
  `company.memberships.count` and `company.tracked_actions.count`). On the
  `/admin/signup_links/:uuid/companies` endpoint, `SerializeAdminCompanies`
  passes the company collection but doesn't appear to preload counts. Likely
  N+1 in production for popular signup links — worth checking with Prosopite.

- **`Admin::SignupLinksController#use_signup_link!`** looks up
  `params[:id] || params[:signup_link_id]`. That's fine, but it means a stray
  call to `/admin/signup_links/:id/companies` for a missing UUID returns a
  404 with `error.type: "signup_link_not_found"` — which is what the admin
  expects. Don't change this without updating the admin error mapping.

- **There's no contract test that verifies `SerializeSignupLink` covers every
  permitted field on round-trip** (write via `create_params`, read via
  serializer, assert symmetry). Worth considering — it would catch the case
  where a new field becomes writable but isn't read back, which the admin
  UI relies on for `initialFormState`.

## 5. Deferred review follow-ups (2026-06-15)

Items surfaced during code review that are real but not currently breaking. Left as TODOs so we can batch them; none change observable behaviour today.

- **`ManagedCompany.analytics_tags` typed as optional** (`lib/manage/api.ts:20`). The Rails column is `null: false, default: []` and `SerializeAdminCompany` always emits it, so the type should be `analytics_tags: string[]` (non-optional) and the `?? []` guard in `components/manage/org-tags-panel.tsx` should go. Harmless today because `?? []` matches the empty-array default; tightening is purely a cleanup.

- **`SignupLink.created_at` typed as optional, but the serializer never returns it** (`lib/signup-links/types.ts:20`, `components/signup-links/signup-links-table.tsx:52`). The list table renders a "Created" column that always falls back to `formatShortDateTime(null)` because `SerializeSignupLink` doesn't include `created_at`. Fix is on the Rails side: add `created_at: signup_link.created_at.iso8601` to the serializer (and refresh `e2e/fixtures/signup-link/canonical.json`), then make the TS type required. Until then the column shows the empty fallback.

- **Mock delete gate is looser than Rails** (`e2e/mock-api/routes.ts:181`). Rails raises `SignupLinkInUseError` if `uses_count.positive? || companies.exists?` (`api/app/commands/signup_link/destroy.rb:7`); the mock only checks `consumed_count > 0`. Missing the case where a user started signup but never completed (`uses_count > 0`, `consumed_count == 0`). Update the mock to mirror both conditions. Naming nit while we're there: `uses_count` (any attempt) vs `consumed_count` (completed signup) is genuinely confusing — worth a comment in the canonical fixture or the type.

- **`useCompanyTagUniverse` / `useFeatureFlagCatalogue` caches never invalidate** (`components/signup-links/form/use-form-data.ts`). `buildLoader` does expose `.invalidate()` (line 62), but nothing calls it. Adding a tag via `OrgTagsPanel` invalidates the *other* tag cache (`invalidateTagsCache` in `lib/tags/use-tags.ts`) — the signup-link form's universe is a separate loader that stays stale until page reload. Fix: call `useCompanyTagUniverse.invalidate()` alongside `invalidateTagsCache()` in `org-tags-panel.tsx`, or consolidate the two caches behind react-query so there's one source of truth.

## How the admin e2e suite is structured (for reference)

- `e2e/mock-api/store.ts` — in-memory `Map<uuid, SignupLink>` per test,
  with feature flags / companies seeded per spec.
- `e2e/mock-api/routes.ts` — Playwright `page.route` handler that pattern-
  matches by path (any host) on `/admin/*` and `/auth/*`.
- `e2e/specs/*.spec.ts` — one file per logical scenario. Each spec asserts
  BOTH the captured request body (what we sent Rails) AND the rendered UI
  (what we did with what Rails returned).
- `e2e/fixtures/signup-link/canonical.json` — copy of the serializer test's
  `expected` hash. **Do not edit by hand** — refresh from Rails.
