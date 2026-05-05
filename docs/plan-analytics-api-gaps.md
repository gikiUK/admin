# Analytics — API Gaps

What the analytics spec asks for vs. what the Rails API at `../api`
currently records. Each gap below is a thing **we cannot answer today**
because the data was never captured. Companion to
[plan-analytics.md](./plan-analytics.md).

Conventions:
- ✅ exists — usable as-is.
- ⚠️ partial — exists but in a form that won't answer the spec's questions
  (e.g. lives in a JSON bag, missing index, wrong granularity).
- ❌ missing — needs new column / table / event / job.

---

## 1. `analytics_events` table

The table itself exists with `id`, `action_type`, `user_id`, `company_id`,
`details` (jsonb), `created_at`. Indexes on `action_type`, `user_id`,
`company_id`, `created_at`.

| Spec field        | Status     | Gap                                                                                                           |
|-------------------|------------|---------------------------------------------------------------------------------------------------------------|
| `id`              | ✅          |                                                                                                               |
| `timestamp`       | ✅          | `created_at` serves the purpose.                                                                              |
| `user_id`         | ✅          |                                                                                                               |
| `org_id`          | ✅          | Stored as `company_id`. Spec says "always present, even for solo users" — currently nullable; **need to enforce non-null** going forward (see §3). |
| `session_id`      | ❌          | No column, no concept. Sessions are not tracked at all.                                                        |
| `event_name`      | ⚠️         | Stored as `action_type` (string). Functionally fine; just rename in the serializer for spec parity.            |
| `plan_id`         | ❌          | No column. Also: there is no `plans` table — see §6.                                                           |
| `action_id`       | ⚠️         | Sometimes embedded in `details` jsonb. Not promoted, not indexed.                                              |
| `tier`            | ❌          | Not stamped on the event. Today we'd have to look up `companies.subscription_tier` at query time, which loses history through upgrades — exactly the thing the spec calls out as the reason to denormalise. |
| `properties`      | ✅          | `details` jsonb plays this role.                                                                               |

**What to record that we don't today:**
- `session_id` on every event.
- `tier` snapshot at write time (so post-upgrade analysis still works).
- `plan_id` once plans exist.
- `action_id` promoted out of `details` and indexed.

---

## 2. Event taxonomy — what we fire today vs the spec

We currently fire ~25 distinct `action_type` values via
`AnalyticsEvent::Create.defer`. Mapping to the spec's three tiers:

### Tier 1 — Lifecycle
| Spec event        | Status | Notes                                                                                              |
|-------------------|--------|----------------------------------------------------------------------------------------------------|
| `user_signed_up`  | ✅      | Fired in `User::Bootstrap`.                                                                        |
| `session_start`   | ❌      | No session concept anywhere. **Cannot compute MAU/WAU/DAU correctly today** — best proxy is `user_logged_in`, which misses already-logged-in users browsing the app. |
| `session_end`     | ❌      | Same as above. Without it we cannot compute session length, which is a headline spec metric.       |

### Tier 2 — Feature engagement
| Spec event              | Status | Notes                                                                                                          |
|-------------------------|--------|----------------------------------------------------------------------------------------------------------------|
| `plan_created`          | ❌      | No event. No `plans` table either — today a "plan" is implicit (= the set of `company_tracked_actions` for a company). |
| `action_added`          | ⚠️     | We fire `tracked_action_created`. Need to align name and ensure `action_type` (theme/category) is in payload.  |
| `action_state_changed`  | ⚠️     | We fire `tracked_action_status_updated`. Need to add `from_state`, `to_state`, and `source` (`user` / `onboarding` / `system`) to the payload. Currently the source is implied by code path, not recorded. |
| `report_generated`      | ❌      | Not fired. `Document` model exists with `published_at` / `status` — needs an event hook on publish.            |
| `feature_viewed`        | ❌      | No page/CTA tracking at all. Has to be emitted from front-end (`../front-end`), not the API.                   |

### Tier 3 — Funnel
| Spec event              | Status | Notes                                                                                                                       |
|-------------------------|--------|-----------------------------------------------------------------------------------------------------------------------------|
| `upgrade_clicked`       | ❌      | Not tracked. Need to wire from the front-end at every upgrade CTA. Must include `source` (which feature triggered it).      |
| `checkout_started`      | ❌      | Not tracked. Wire into the Stripe checkout-session creation path.                                                           |
| `purchase_completed`    | ⚠️     | We have a `payments` table (`amount_in_cents`, `tier`, `data` jsonb) so the *fact* is captured, but no analytics event is emitted, and `companies.upgraded_at` is not populated — making "free-to-premium conversion rate" hard to compute without scanning payment history. |
| `subscription_cancelled`| ❌      | We track `subscription_status` (incl. `cancelling`/`canceled`) but emit no event and capture no `reason`.                   |

**What to record that we don't today:**
- Sessions (the entire concept).
- Plan lifecycle (`plan_created`).
- State-change provenance (`from_state`, `to_state`, `source`).
- Report generation.
- Page/CTA engagement (front-end work).
- Funnel events with payload (`source` / `plan_type` / `billing_period` / `amount_gbp` / `reason`).

---

## 3. `users` table

Exists. Devise-style auth fields all present.

| Spec column            | Status | Gap                                                                                                                      |
|------------------------|--------|--------------------------------------------------------------------------------------------------------------------------|
| `id`, `email`, `name`  | ✅     |                                                                                                                          |
| `signed_up_at`         | ✅     | `created_at` serves.                                                                                                     |
| `org_id`               | ⚠️     | Users belong to multiple companies via `company_memberships`. The spec assumes a single `org_id` per user. **Need product decision**: pick "primary" org or model multi-tenancy properly in the analytics layer. |
| `role`                 | ⚠️     | Stored on `company_memberships.role`, not `users`. Per-org role is more correct but spec wants it on the user.            |
| `last_active_at`       | ❌     | Not recorded.                                                                                                            |
| `activated_at`         | ❌     | Not recorded. **Definition is also undefined** — what counts as activation? (See open questions in plan-analytics.md.)    |
| `invited_by_user_id`   | ⚠️     | Recoverable from `company_invitations.invited_by_id` + `accepted_by_id`, but not denormalised. No referral chains today. |
| `status`               | ❌     | Not recorded. Spec values (`active`/`churned`/`invited`) are not modelled — would need to be derived from event activity. |

**What to record that we don't today:**
- `last_active_at` (updated on every `session_start` once sessions exist).
- `activated_at` (after we define the activation event).
- `invited_by_user_id` denormalised onto users for fast referral queries.
- A `status` enum or a derived view.

---

## 4. `user_metrics` (pre-aggregate)

Status: ❌ table does not exist.

Everything in this table is **derivable** from `analytics_events`, but the
whole point per the spec is to avoid querying the event log for every
dashboard widget. Without it, every chart on the analytics page does a
full event-log scan.

**What to record that we don't today:**
- The table itself (`user_id`, `computed_at`, `session_count_total`,
  `events_count_total`, `features_used` jsonb).
- A recurring job (`UserMetric::Recompute`) — solid_queue recurring task.

---

## 5. `organisations` (= `companies`)

| Spec column            | Status | Gap                                                                                                              |
|------------------------|--------|------------------------------------------------------------------------------------------------------------------|
| `id`, `name`           | ✅     |                                                                                                                  |
| `tier`                 | ✅     | `subscription_tier` (enum: `standard`, `premium`).                                                               |
| `signed_up_at`         | ✅     | `created_at`.                                                                                                    |
| `sub_industry`         | ⚠️     | Lives in `company_answers` (jsonb), not promoted to a column. Querying it requires jsonb lookups + answer parsing. |
| `business_size`        | ⚠️     | Same — in `company_answers`.                                                                                     |
| `workshop_id`          | ❌     | No FK on `companies`. Today the link is many-to-many via `webinar_attendees`. Spec implies a single workshop per org. |
| `upgraded_at`          | ❌     | Not stored. Recoverable from `payments` (earliest premium payment) but lossy — would miss trial conversions and cancel/re-upgrade flows. |

**What to record that we don't today:**
- `sub_industry`, `business_size` promoted from answers to columns
  (or surfaced via the `organisation_profile` aggregate — see §5b).
- `workshop_id` (or accept multi-workshop and join via `webinar_attendees`).
- `upgraded_at` set on first premium activation; should also probably
  store `last_upgraded_at` to handle re-upgrades.
- A `tier` history. The spec says "store tier on the event row" to
  preserve history — but we *also* need it on the company for
  point-in-time queries. Consider a `company_tier_changes` table or a
  jsonb history column.

---

## 5b. `organisation_profile`

Status: ❌ does not exist.

The raw data does exist (`company_answers`, key/value with jsonb). Spec
wants a wide table — one column per fact — for ergonomic BI joins.

**Considerations specific to our setup:**
- We have ~66 facts according to the spec. The fact set is **defined by
  the live `FactsDataset`**, and changes when admins publish a new draft.
  A static schema migration won't keep up — needs to be a SQL view
  generated from the live dataset, or a recompute job that ALTER TABLEs
  on dataset publish. The view route is safer.
- Some facts are **derived** (computed by `FactsEngine::DeriveFactsFromAnswers`
  from raw answers + rules), not directly answered. The aggregate must
  call the engine, not just pivot `company_answers`.

**What to record that we don't today:**
- A view or aggregate table over the engine's derived facts per company.

---

## 6. `organisation_plans`

Status: ❌ does not exist. Plans are not a first-class concept at all.

Today, "the plan" for a company = `company.tracked_actions`. There is
no row to attach `created_at`, `created_by_user_id`, or
`last_activity_at` to.

**Open product question first**: are plans a real concept being
introduced (so a company can have multiple)? Or is "plan" just a
reporting alias for "all the company's tracked actions"?

If the latter, the spec's `organisation_plans` table is really just an
aggregate over `company_tracked_actions` per company:

| Spec column                           | Source                                                             |
|---------------------------------------|--------------------------------------------------------------------|
| `actions_count`                       | `count(*)` of `company_tracked_actions` for the company.           |
| `actions_not_started`                 | Same, filtered to `status = not_started`.                          |
| `actions_in_progress`                 | Same, `status = in_progress`.                                      |
| `actions_completed`                   | Same, `status = completed`.                                        |
| `actions_not_relevant`                | Same, `status = rejected` (our enum name; semantic match).          |
| `actions_onboarding_already_doing`    | Same, `pre_giki_status = already_doing`.                           |
| `actions_onboarding_previously_done`  | Same, `pre_giki_status = previously_done`.                         |
| `completion_rate`                     | Computed.                                                          |
| `last_activity_at`                    | `MAX(created_at)` from `company_tracked_action_events` for the company. |
| `user_count`                          | Count of `company_memberships` for the company. ⚠️ Spec says "active users in this org" — we'd need to define active (e.g. user_metrics.last_active_at > 30d) which depends on §3 + §4. |
| `created_at`, `created_by_user_id`    | ❌ No analogue. There is no plan-creation moment recorded today — earliest tracked-action proxy is the best we can do, attribution is impossible. |

**What to record that we don't today:**
- The aggregate itself (table or view, recomputed nightly).
- A genuine `plan_created` moment if plans become first-class. Without
  it, "time to first action" loses its anchor.

---

## 7. `organisation_plan_actions`

Status: ⚠️ partially derivable.

This is essentially `company_tracked_actions` joined to `actions` for
the human-readable name. Spec columns vs ours:

| Spec column          | Status | Notes                                                                                       |
|----------------------|--------|---------------------------------------------------------------------------------------------|
| `id`                 | ✅     | `company_tracked_actions.id`.                                                               |
| `plan_id`            | ❌     | No plan concept (see §6).                                                                   |
| `org_id`             | ✅     | `company_id`.                                                                               |
| `action_type`        | ⚠️     | `action_type` on tracked_action is the *Ruby class* (e.g. `Action`, `Company::CustomAction`). The spec means **theme/category**, which lives on `actions.category` or `action_data.theme`. Need to denormalise. |
| `action_name`        | ⚠️     | On `actions.title` / `company_custom_actions.title`. Polymorphic — need to resolve.         |
| `state`              | ✅     | `status`.                                                                                   |
| `created_at`         | ✅     |                                                                                             |
| `state_changed_at`   | ❌     | Not stored on `company_tracked_actions`. Recoverable via `MAX(created_at)` from `company_tracked_action_events WHERE event_type='status_changed'`. **Should be denormalised** to keep dashboard queries cheap. |
| `properties`         | ⚠️     | We have `due_date`, `notes`, `assignee_*`, `pre_giki_status` as columns, but no jsonb bag. Either add `properties` jsonb or compose it at serialize time. |

**What to record that we don't today:**
- `state_changed_at` denormalised onto `company_tracked_actions`
  (or accept the join on every query).
- A flat `action_type` (theme) and `action_name` (title) on the
  tracked-action row, polymorphism resolved.

---

## 8. Sessions — the biggest single gap

Multiple spec metrics depend on sessions and **none are answerable today**:

- WAU / MAU / DAU (correctly — proxies via `user_logged_in` undercount).
- Stickiness (DAU ÷ MAU).
- Retention (week-N return).
- Churn (no session in 90 days).
- Session length.
- Activation-within-14-days.

**What to record that we don't today:**
- Front-end-issued `session_id` (uuid in localStorage with idle timeout).
- `session_start` / `session_end` events with `duration_seconds` and
  `events_in_session`.
- `session_id` column on `analytics_events`.
- Update `users.last_active_at` on `session_start`.

---

## 9. Conversion / payment gaps

We have `payments`, `companies.subscription_tier/status/valid_until`,
`subscriptions` jsonb, `trial_ends_at`. What we don't have:

- `companies.upgraded_at` (first premium activation timestamp).
- `purchase_completed` analytics event with `amount_gbp` /
  `plan_type` / `billing_period` payload — currently we'd need to join
  `payments` for the amount and infer the rest.
- `subscription_cancelled` event with **`reason`** — we capture the
  cancellation status change but never ask why.
- `upgrade_clicked` and `checkout_started` (front-end only).

Without these we cannot answer "what predicts conversion?" — the
14-days-pre-upgrade behaviour analysis the spec calls out as headline.

---

## 10. Cohort / workshop / referral gaps

| Need                                 | Status | Gap                                                                                             |
|--------------------------------------|--------|-------------------------------------------------------------------------------------------------|
| Workshop-cohort breakdown            | ⚠️     | `webinar_attendees` is many-to-many. Spec assumes single `workshop_id` per org. Need decision.  |
| Referrer per workshop                | ✅     | `webinars.referrer_id` → `referrers`.                                                           |
| User-to-user referral chains         | ⚠️     | `company_invitations.invited_by_id` exists but isn't denormalised onto the resulting user.      |
| `invite_source` on `user_signed_up`  | ❌     | Spec calls for it; we don't include it in `details` today.                                      |

---

## 11. Admin dashboard summary endpoint (blocks Phase 1 KPIs)

The admin app's Phase 1 analytics page (KPI cards + breakdowns)
currently shows a "Backend pending" callout because there is no
endpoint to consume. All source data is already in the DB — this is
purely a Rails buildout task.

**Endpoint:** `GET /admin/analytics/summary?from=<iso>&to=<iso>`

**Expected response shape** (matches `AnalyticsSummary` in
`admin/lib/analytics/api.ts`):

```json
{
  "range": { "from": "...", "to": "..." },
  "active_users": { "dau": 0, "wau": 0, "mau": 0 },
  "active_orgs": 0,
  "new_signups": 0,
  "new_companies": 0,
  "tracked_actions_added": 0,
  "tracked_actions_completed": 0,
  "avg_completion_rate": 0.0,
  "status_distribution": { "not_started": 0, "in_progress": 0, "completed": 0, "archived": 0, "rejected": 0 },
  "top_completed_action_types": [{ "action_type": "...", "count": 0 }],
  "at_risk_orgs": [{ "company_id": 1, "company_name": "...", "last_activity_at": "...", "not_started_count": 0 }]
}
```

**Implementation notes for the Rails PR:**
- Single `AnalyticsSummary::Compute` Mandate command, accepts
  `from:` / `to:`, returns the hash. One controller (`Admin::AnalyticsSummaryController#show`).
- All data sources exist today:
  - DAU/WAU/MAU = distinct `user_id` from `analytics_events` over period
    windows. Caveat: this is a proxy — see §8 (sessions). Document the
    proxy in the response or in the endpoint docs.
  - `active_orgs` = distinct `company_id` from `analytics_events`.
  - `new_signups` = count of `analytics_events.action_type = 'user_signed_up'`.
  - `new_companies` = count of `analytics_events.action_type = 'company_created'`.
  - `tracked_actions_added` / `_completed` = count from
    `company_tracked_action_events` filtered by `event_type` /
    `status`.
  - `avg_completion_rate` = AVG over companies of
    `count(status=completed) ÷ count(*)` from `company_tracked_actions`.
  - `status_distribution` = group `company_tracked_actions.status`.
  - `top_completed_action_types` = group
    `company_tracked_action_events` by `action_type` where
    `event_type='status_changed' AND status='completed'`, limit 10.
  - `at_risk_orgs` = companies whose latest
    `company_tracked_action_events.created_at` is >60 days ago and
    that have any `company_tracked_actions.status='not_started'`.
- Consider 60s `Rails.cache.fetch` if any of the queries become heavy.
- Mount under existing `admin` namespace next to the
  `analytics_events` route:
  `get "analytics/summary", to: "analytics_summary#show"`.

This is one focused PR on `../api`. Until it lands, Phase 1's KPI
section and breakdowns section render the "Backend endpoint pending"
callout — the layout is real, the data isn't.

---

## Priority order (what to record first)

If we were to start instrumenting **right now**, the order that unlocks
the most spec metrics per unit of work:

1. **Sessions** (`session_start` / `session_end` + `session_id` column).
   Unblocks 6+ headline engagement metrics on its own.
2. **`tier` on every event row** (denormalise at write time).
   Unblocks all conversion/funnel analysis through upgrade events.
3. **`upgraded_at` on companies** + `purchase_completed` / `subscription_cancelled` events with payload.
   Unblocks the conversion funnel.
4. **State-change provenance** on `action_state_changed` (`from_state`, `to_state`, `source`).
   Unblocks "organic vs onboarding" splits and time-to-first-action.
5. **`organisation_plans` aggregate** (job + table/view).
   Unblocks every plan-progress dashboard without scanning event log.
6. **`feature_viewed`** (front-end) — needed for feature-adoption metrics.
7. **`organisation_profile` view** (engine-derived per-org fact pivot).
   Unblocks the "platform's unique angle" cross-tabs.
8. **Users table additions** (`last_active_at`, `activated_at`, `invited_by_user_id`, `status`).
9. **Plan-as-first-class** — only if product confirms it's a real concept.

Items 1–4 are small migrations + small code edits. Items 5–9 are
multi-day work each.

**Item 0 (blocking Phase 1 admin KPIs):** the `/admin/analytics/summary`
endpoint described in §11. No new schema, just SQL aggregations —
should be the fastest of all of these.
