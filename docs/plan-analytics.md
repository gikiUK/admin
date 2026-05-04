# Analytics Page — Plan & TODOs

## Overview

We are adding an **Analytics** page to the admin UI. The page surfaces product, plan,
profile, and conversion metrics derived from a richer event stream and a set of
pre-aggregated tables on the Rails backend (`../api`).

In parallel, the top-level admin sidebar is being restructured: a new **Data**
section will group `Facts`, `Analytics`, `Airtable`, etc. (Only Analytics is in
scope here — the menu restructure lands as part of the same PR so the new page
has a home.)

This document is the single source of truth for the work. It captures:

1. The target schema described in the analytics spec.
2. What already exists in `../api` (so we don't redo it).
3. The gap — schema, event taxonomy, aggregation, and admin UI work.
4. A phased TODO list.

---

## What already exists in `../api`

Confirmed by reading `db/schema.rb` and `app/`:

- **`analytics_events` table** exists with: `id`, `action_type` (string),
  `user_id` (nullable), `company_id` (nullable), `details` (jsonb), `created_at`.
  Indexed on `action_type`, `company_id`, `user_id`, `created_at`.
- **`AnalyticsEvent::Create.defer(action_type, user:, company:, details:)`**
  is the canonical emitter, queued on the `:analytics` queue.
- Events are already fired for: `user_signed_up`, `user_logged_in`, `email_confirmed`,
  `company_created`, `company_deleted`, `onboarding_question_answered`,
  invitation lifecycle (`invitation_sent/accepted/declined/revoked`,
  membership role changes), tracked-action lifecycle (create / delete /
  status / due_date / assignee / notes), custom-action lifecycle.
- **`Admin::AnalyticsEventsController#index`** + `AnalyticsEvent::Search`
  + `SerializeAdminAnalyticsEvent(s)` already paginate + filter by
  `action_type` / `company_id` / `user_id` / `order`. Route mounted at
  `resources :analytics_events, only: [:index]` under admin.
- `Admin::AnalyticsEventsChannel` broadcasts new events in real time.
- **Plan-state data already lives on `company_tracked_actions`** (status,
  pre_giki_status, due_date, assignee, notes, timestamps) and
  `company_tracked_action_events` (state-change history). These are the v1
  source for plan/action metrics — no new event table is needed for that
  axis, but the spec's `organisation_plans` aggregate does not exist yet.
- `companies.subscription_tier` / `subscription_status` /
  `subscription_valid_until` / `trial_ends_at` exist — tier history is
  *not* preserved per-event yet.
- `webinars` + `webinar_attendees` exist (cohort/workshop data is queryable;
  no `workshop_id` foreign key on `companies` yet).
- `referrers` + `webinars.referrer_id` exist.
- No `users.role`, `users.activated_at`, `users.invited_by_user_id`,
  `users.last_active_at` columns yet (the spec's `users` table additions).
- No `user_metrics`, `organisation_profile`, `organisation_plans`, or
  `organisation_plan_actions` aggregate tables.
- No `session_id` / `session_start` / `session_end` events.
- `analytics_events` has no `session_id`, `tier`, `plan_id`, `action_id`
  columns (everything currently lives in the `details` jsonb bag).

The takeaway: the **shape** of the v1 event log is right, but the spec
calls for promoting some `details` keys to first-class columns, adding
sessions, adding aggregate tables, and expanding the event taxonomy.

---

## What admin already exposes

- Top-level sidebar: `components/top-level-sidebar.tsx` (BCorps, Airtable,
  Downloads, Workshops, Facts Engine).
- `(dashboard)` route group with per-section `layout.tsx` + `page.tsx` is
  the pattern to follow (see `app/(dashboard)/airtable/page.tsx`).
- `lib/airtable/api.ts` is the precedent for typed fetchers (`fetch` +
  `getApiUrl(path)` + `credentials: "include"`).
- `components/page-header.tsx`, shadcn/ui primitives, Lucide icons, and
  Outfit font are the design system.

---

## Scope cut: phase 1 vs later

Phase 1 (this PR) **does not** require the full backend buildout. Goal is
an analytics page that is useful **today** off existing data, with the
backend gaps tracked as follow-ups.

- **Phase 1 (UI-only off existing data)**: events explorer + headline
  engagement / plan-completion KPIs computed in Rails on the fly from
  `analytics_events` + `company_tracked_actions`.
- **Phase 2 (backend)**: schema migrations, session tracking, expanded
  event taxonomy, aggregate tables.
- **Phase 3 (BI-grade dashboards)**: profile-cross-tab, conversion
  funnel, cohort/workshop reporting.

---

## Menu restructure (Data section)

- [x] Introduce a `Data` group in `components/top-level-sidebar.tsx`
      containing **Airtable**, **Analytics**, **Downloads**, **Facts Engine**
      (alphabetical). Implemented as a collapsible `SidebarMenuSub` rather
      than `SidebarGroupLabel` for consistency with Lucide chevron behaviour.
- [x] Decided: Workshops stays top-level, Downloads moved under Data.
      BCorps moved to a "Legacy" labelled section pending its rework.
- [x] `isActive` logic: each menu entry has a `matchPaths` array that
      drives the highlight; collapsible group auto-opens when any child
      matches. Centralised in `components/sidebar/menu-config.ts`.
- [x] `Facts Engine` link still points at `/data/facts` — only the
      visual grouping changed.

---

## Phase 1 — Analytics page (ship first)

### 1.1 Routing & shell
- [x] Create `app/(dashboard)/analytics/layout.tsx` + `page.tsx`.
- [x] Use `PageHeader` with title "Analytics" and a preset date-range
      picker (7d / 30d / 90d / YTD) as `action`. Default 30d. Range
      selection is URL-driven (`?range=30d`).
- [x] Add the route to the new `Data` sidebar group.

### 1.2 Event explorer (works off existing data)
- [x] `components/analytics/events-table.tsx` — paginated table over
      `GET /admin/analytics_events`. Columns: when, event, user, company,
      collapsible JSON details.
- [x] `lib/analytics/api.ts` — typed fetcher built on a new shared
      `lib/api/client.ts` (`apiFetch`, `ApiError`, `Paginated<T>`,
      `buildQuery`). Types match `SerializeAdminAnalyticsEvent` exactly.
- [x] Filters in the URL (`?action_type=`, `?company_id=`, `?user_id=`,
      `?order=oldest|newest`, `?page=`) via a shared `useUrlState` hook.
- [ ] Live tail toggle: subscribe to `Admin::AnalyticsEventsChannel` and
      prepend new events to the table. **Deferred** — admin app has no
      ActionCable client wired yet; not worth the plumbing for v1.

### 1.3 Headline KPI cards (off existing data)
- [x] UI shells implemented: DAU/WAU/MAU, active orgs, new signups,
      new companies, actions added/completed, avg. completion rate,
      status mix. Single shared `KpiCard` component, all cards driven
      by one `useSummary` hook. Cards show "Backend endpoint pending"
      callout when `/admin/analytics/summary` is missing.
- [ ] **Backend wiring blocked**: `/admin/analytics/summary` does not
      exist yet — moved to
      [plan-analytics-api-gaps.md](./plan-analytics-api-gaps.md).

### 1.4 Tracked-action breakdowns
- [x] UI shells implemented: status distribution (CSS bars, no chart
      lib), top completed action types list, at-risk orgs table.
      Components: `status-distribution.tsx`, `top-completed-actions.tsx`,
      `at-risk-orgs.tsx`, composed by `breakdowns-section.tsx`.
- [ ] **Backend wiring blocked** — same `/admin/analytics/summary`
      dependency.

### 1.4b Event-stream derivations (off `analytics_events` only)
- [x] `recharts` + shadcn `chart` component installed (no other chart
      lib precedent in the repo; recharts is the shadcn default).
- [x] `events-time-series.tsx` — per-day events bar chart over the
      selected range. Pure derivation off `analytics_events.created_at`
      group-by-day. Card titled "Activity".
- [x] `top-action-types.tsx` — horizontal-bar leaderboard of top 10
      `action_type` values in range. Pure derivation off
      `analytics_events.action_type`.
- [x] `AnalyticsSummary` TS type extended with `events_over_time` and
      `top_action_types`.
- [x] `plan-analytics-summary-endpoint.md` updated with both fields,
      densification rule (emit zero rows for empty days), and SQL
      guidance (`DATE(created_at AT TIME ZONE 'UTC')` for stable
      buckets). **Backend shipped.**

### 1.5 Page restructure: tabs
Mature analytics products (Mixpanel/Amplitude/PostHog/GA4) split by
*question being answered*, not by data shape. Applied here:

- [x] Tabs introduced via shadcn `Tabs` (line variant): **Overview**,
      **Activity**, **Breakdowns**, **Events**.
- [x] Active tab is URL-driven (`?tab=`) via existing `useUrlState`,
      defaulting to `overview`. Date range stays page-level (single
      global control).
- [x] **Single shared `useSummary` hit at the page level** — sections
      are now presentational (data-in-via-props). Tab switches are
      instant; no refetch.
- [x] Tab containers: `overview-tab.tsx`, `activity-tab.tsx`,
      `breakdowns-section.tsx` (already existed, now data-only),
      `EventsExplorer` inlined into the events tab (no need to wrap
      a single component).
- [x] Loading / pending-backend / error states handled at the page,
      not duplicated per tab.

### 1.6 Activity-tab filters + granularity (deferred)
State-of-the-art analytics: trend charts let you slice by event name
and pick day/week/month bucketing. Both need a small backend change.
- [ ] API: accept `event_names[]` query param and filter
      `events_over_time` accordingly.
- [ ] API: accept `granularity=day|week|month` and switch
      `DATE_TRUNC(...)`.
- [ ] UI: multi-select event filter + granularity toggle on the
      Activity tab; both reflected in the URL.
- [ ] UI: ability to compare multiple series on the same chart
      (Mixpanel-style) — depends on the multi-select.

### 1.5 Backend support for phase 1
- [ ] **Out of scope for the admin PR.** Tracked in
      [plan-analytics-api-gaps.md](./plan-analytics-api-gaps.md):
      `Admin::AnalyticsSummaryController#show` returning the shape
      consumed by `KpiSection` + `BreakdownsSection`. Single
      `AnalyticsSummary::Compute` command, accepts `from:` / `to:`,
      consider 60s `Rails.cache.fetch` if the queries are heavy.

### 1.6 Ship checklist
- [x] `pnpm run check` clean for new files.
- [ ] `pnpm run test` — no new Jest tests added (URL-state hook + API
      client are the two highest-value targets; deferred to follow-up).
- [x] `npx tsc --noEmit` clean for new files (one pre-existing error
      in `components/questions/question-type-badge.tsx` unrelated).
- [ ] Manual QA: pending — needs the admin running against API to
      verify events table paginates and filters round-trip.

---

## Phase 2 — Backend buildout (spec alignment)

These are the gaps between the v1 schema and the spec. Each is its own PR
on `../api`. Order matters — sessions and column promotions unlock the
rest.

### 2.1 Promote `analytics_events` columns
- [ ] Migration: add `session_id` (string, indexed),
      `tier` (string, indexed), `plan_id` (bigint, nullable, indexed),
      `action_id` (bigint, nullable, indexed) to `analytics_events`.
      Backfill `tier` from `companies.subscription_tier` for historical
      rows (best-effort — flag as approximate).
- [ ] Update `AnalyticsEvent::Create.defer` signature to accept
      `session_id:`, `plan_id:`, `action_id:` and to **stamp `tier`
      automatically from the company at write time** (this is the whole
      point of the column — preserve history through upgrades).
- [ ] Rename `action_type` → `event_name` to match the spec, OR alias in
      the serializer. Recommend serializer alias to avoid touching every
      call site.

### 2.2 Sessions
- [ ] Decide: front-end-generated `session_id` (uuid in cookie/local
      storage with idle timeout) is simplest. Document in
      `docs/state-management.md`.
- [ ] Emit `session_start` (no payload) and `session_end`
      (`{ duration_seconds, events_in_session }`) from the **front-end
      app** (../front-end), not admin.
- [ ] Update `users.last_active_at` on every `session_start` (DB trigger
      or in `AnalyticsEvent::Create`).

### 2.3 Expand event taxonomy
Tier 2 / Tier 3 events from the spec we don't fire yet:
- [ ] `plan_created` — emit when first
      `company_tracked_action` is created for a company (proxy until
      explicit plans exist), or when a real Plan model is added.
- [ ] `action_added` (replaces / supplements
      `tracked_action_created`) — include `action_type`.
- [ ] `action_state_changed` — include `from_state`, `to_state`,
      `source` (`user` vs `onboarding` vs `system`). The
      `pre_giki_status` field already hints at this.
- [ ] `report_generated` — include `report_type`. Wire in
      `Document::Publish` or wherever reports finalise.
- [ ] `feature_viewed` — fire from front-end on key page navigations
      and CTAs. Define a small allowlist of `feature_name` values to
      keep cardinality bounded.
- [ ] **Funnel events** (`upgrade_clicked`, `checkout_started`,
      `purchase_completed`, `subscription_cancelled`) — wire into the
      Stripe checkout flow + cancellation flow.

### 2.4 Users table additions
- [ ] Migration: add `users.role` (enum: `admin`, `member`),
      `users.activated_at` (timestamp), `users.invited_by_user_id`
      (bigint, FK), `users.last_active_at` (timestamp), `users.status`
      (enum: `active`, `churned`, `invited`).
      *Note:* role already lives on `company_memberships.role` per-org
      — confirm whether spec means org-role or global-role before adding
      the column.
- [ ] Backfill `invited_by_user_id` from `company_invitations.invited_by_id`
      where we can match by email at acceptance time.

### 2.5 Aggregate tables
Build these as nightly-recomputed materialised views *or* tables backed
by a recurring job — pick whichever the team prefers. Each has a
`computed_at` timestamp.

- [ ] **`user_metrics`** (`user_id`, `computed_at`,
      `session_count_total`, `events_count_total`, `features_used` jsonb).
      `UserMetric::Recompute` job, scheduled via solid_queue recurring task.
- [ ] **`organisation_plans`** (`org_id`, `plan_id`, `created_at`,
      `created_by_user_id`, `computed_at`, `user_count`, `actions_count`,
      `actions_not_started`, `actions_in_progress`, `actions_completed`,
      `actions_not_relevant`, `actions_onboarding_already_doing`,
      `actions_onboarding_previously_done`, `completion_rate`,
      `last_activity_at`).
- [ ] **`organisation_plan_actions`** (`id`, `plan_id`, `org_id`,
      `action_type`, `action_name`, `state`, `created_at`,
      `state_changed_at`, `properties` jsonb). Likely a 1:1 view over
      `company_tracked_actions` joined to `actions`.
- [ ] **`organisation_profile`** — one row per org, one column per
      `company_answer` key, computed by pivoting `company_answers`.
      Generate the schema from the live facts dataset (so adding a fact
      to the dataset auto-adds a column on next sync). Decide: real
      table vs SQL view vs analytics warehouse export.
- [ ] **`organisations`** spec extras: add `sub_industry`,
      `business_size`, `workshop_id`, `upgraded_at` to `companies`.
      First two are likely already in `company_answers` — promoting them
      is the easy part. `workshop_id` needs a FK to `webinars` (or a new
      `workshops` table if v1 webinars ≠ spec workshops).

---

## Phase 3 — BI-grade dashboards in admin UI

Each section is a tab on `/analytics`. Build them as data shows up from
phase 2.

### 3.1 Engagement
- [ ] Retention cohort grid (week N retention by signup week).
- [ ] DAU/MAU stickiness over time chart.
- [ ] Churn list (orgs with no `session_start` in 90 days).
- [ ] Feature adoption table from `user_metrics.features_used`.

### 3.2 Plans & actions
- [ ] Average actions per plan, distribution histogram.
- [ ] Time-to-first-action distribution.
- [ ] Plan momentum chart (in-progress moves per org per month).
- [ ] At-risk org list (uses `last_activity_at` from
      `organisation_plans`).
- [ ] Onboarding baseline vs organic-progress split per org.

### 3.3 Profile insights (the platform's unique angle)
- [ ] Profile completion % per org (count of answered facts / total facts).
- [ ] Cross-tabs: completion-rate by `business_size`, by `sub_industry`,
      by `measures_emissions`, by `reduction_targets`.
- [ ] **Action completion speed by profile fact** — e.g. "do orgs with
      company vehicles complete transport actions faster?". This is the
      headline insight per the spec.

### 3.4 Conversion funnel
- [ ] Free → premium conversion rate (overall + by signup cohort).
- [ ] Activation rate (% hitting activation event within 14 days).
- [ ] Pre-upgrade behaviour: events fired in the 14 days before
      `upgraded_at`, ranked by lift vs baseline.
- [ ] Paid vs free completion-rate comparison.
- [ ] Feature usage by tier (which features paid users use more).

### 3.5 Workshop / cohort reporting (funder-facing)
- [ ] Per-workshop dashboard: `workshop_id` → org list, profile
      breakdown, actions in progress, momentum since workshop date.
- [ ] Top-performing orgs in cohort (ranked by `completion_rate` or
      organic progress).
- [ ] Export as PDF / CSV for funder reports.

---

## Open questions for product

- [ ] Define `activated_at` event criteria. (First action moved to
      in-progress? Plan created? Profile >50% complete?)
- [ ] Confirm whether `users.role` in spec means **org-membership role**
      (already on `company_memberships`) or a **global role**.
- [ ] Are "plans" a new first-class concept, or is "plan" synonymous
      with "all tracked actions for a company" in v1?
- [ ] How is `workshop_id` resolved on a company — single workshop, or
      most-recent? (`webinar_attendees` is many-to-many today.)
- [ ] Cardinality budget for `feature_viewed` — full page-view stream,
      or curated CTA list?

---

## Out of scope (call out explicitly)

- BI export to a warehouse (Metabase, Looker, BigQuery). The spec
  framing is "what could I stick a BI on top of" — phase 2 aggregate
  tables make this trivial later, but we won't build the export now.
- PII / GDPR review of the event payload. Schedule before phase 2
  ships if any `properties` field could contain user-typed text.
