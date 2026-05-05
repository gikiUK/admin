# Implementation plan — `GET /admin/analytics/summary`

**Repo:** `giki/api` (Rails 8.1, Mandate commands, Minitest + FactoryBot).
**Consumer:** the admin app's `/analytics` page (already shipped). The
KPI grid + breakdowns currently render a "Backend pending" callout
because this endpoint doesn't exist. Once it lands, the UI lights up
with no admin-side changes.

This is a **single PR**, no schema migrations, all source data already
exists in the DB. Estimated half a day.

---

## 1. Contract

### Request

```
GET /admin/analytics/summary?from=<iso8601>&to=<iso8601>
```

- `from`, `to`: required, ISO 8601 timestamps. Treat as `[from, to)` half-open
  windows. Reject malformed input with a 400.
- Auth: requires admin (use existing `Admin::BaseController`).

### Response (200)

Match this exactly — the admin-side TS type
(`admin/lib/analytics/api.ts → AnalyticsSummary`) is the source of truth:

```json
{
  "range": { "from": "2026-04-04T00:00:00Z", "to": "2026-05-04T00:00:00Z" },
  "active_users": { "dau": 0, "wau": 0, "mau": 0 },
  "active_orgs": 0,
  "new_signups": 0,
  "new_companies": 0,
  "tracked_actions_added": 0,
  "tracked_actions_completed": 0,
  "avg_completion_rate": 0.0,
  "status_distribution": {
    "not_started": 0,
    "in_progress": 0,
    "completed": 0,
    "archived": 0,
    "rejected": 0
  },
  "top_completed_action_types": [
    { "action_type": "string", "count": 0 }
  ],
  "at_risk_orgs": [
    {
      "company_id": 1,
      "company_name": "Acme",
      "last_activity_at": "2026-02-01T12:00:00Z",
      "not_started_count": 5
    }
  ],
  "events_over_time": [
    { "date": "2026-04-04", "count": 12 },
    { "date": "2026-04-05", "count": 17 }
  ],
  "top_action_types": [
    { "action_type": "user_logged_in", "count": 184 },
    { "action_type": "tracked_action_status_updated", "count": 92 }
  ]
}
```

Notes for each field:

- `range`: echo back the parsed `from`/`to` (helpful for clients that
  pass relative ranges and want to confirm the absolute window).
- `active_users.dau`: ignore the `from`/`to` window — it's "today" by
  definition. Same logic for `wau` (last 7d from now) and `mau` (last
  30d from now). The `from`/`to` window applies to the **other**
  metrics. Document this in the controller comment.
  - Alternative: compute DAU/WAU/MAU strictly off the `to` parameter
    rather than `Time.current`. Either is defensible — pick one and
    stick with it. The admin UI doesn't care which.
- `avg_completion_rate`: decimal in [0, 1]. Average **across companies**
  (not weighted by action count). Skip companies with zero actions
  — don't divide by zero, just exclude them from the average.
- `status_distribution`: keys are the five `Company::TrackedAction::STATUSES`
  values (`not_started`, `in_progress`, `completed`, `archived`, `rejected`).
  Always include all five keys; zero is fine.
- `top_completed_action_types`: top 10 by count, descending. See §2 on
  what `action_type` should mean here.
- `at_risk_orgs`: companies whose latest activity (per
  `MAX(company_tracked_action_events.created_at)`) is more than 60
  days ago **and** that have at least one
  `company_tracked_actions.status = 'not_started'`. Include companies
  with no events at all (`last_activity_at = null`) provided they
  have a not_started action. Cap at 50 rows, ordered by
  `not_started_count DESC`.
- `events_over_time`: one row per day in `[from, to)`, in chronological
  order. `date` is an ISO-8601 date string (`YYYY-MM-DD`) in UTC.
  `count` is the number of `analytics_events` rows whose `created_at`
  falls in that day. **Always emit a row for every day in range, even
  if `count = 0`** — the frontend chart relies on this for an even
  x-axis. Pure derivation off `analytics_events.created_at`, no joins.
- `top_action_types`: top 10 distinct `analytics_events.action_type`
  values in `[from, to)` by row count, descending. Pure derivation off
  `analytics_events`, no joins. Distinct from
  `top_completed_action_types` — that one filters to
  tracked-action *completions*; this one is the raw event-name leaderboard.

### Errors

- 400 if `from` or `to` is missing or unparseable.
- 401/403 handled by `Admin::BaseController` already.
- 500 surfaces normally. No special error envelope needed.

---

## 2. Action-type semantics (the one decision worth making early)

`company_tracked_action_events.action_type` is a **polymorphic Rails
class name** — values are `"Action"` (catalogue actions) or
`"Company::CustomAction"` (org-defined). For
`top_completed_action_types`, the spec means a human-meaningful
*theme* like "Energy" or "Transport", which lives elsewhere:

- For polymorphic class `Action`: `actions.category` (e.g. "Energy")
  or `action_data.theme`. `category` is the nearer concept and is
  validated against `SustainabilityConstants::ACTION_CATEGORY_METADATA`.
- For polymorphic class `Company::CustomAction`: `company_custom_actions.theme`.

**Recommended path for v1**: emit two-shape rows. Group by
`(action_type, action_id)`, resolve the category/theme in Ruby, and
re-aggregate. Example:

```ruby
{ action_type: "Energy", count: 42 }              # resolved theme
{ action_type: "(uncategorised)", count: 3 }      # nil category
{ action_type: "(custom)", count: 7 }             # CustomAction with no theme
```

If that's too much for v1, fall back to grouping by the polymorphic
class name and call it out in a controller comment as a known
limitation. The admin UI just renders the string — it doesn't care
what semantic it carries.

---

## 3. Files to add / modify

### New

```
app/commands/analytics_summary/compute.rb
app/controllers/admin/analytics_summary_controller.rb
test/commands/analytics_summary/compute_test.rb
test/controllers/admin/analytics_summary_controller_test.rb
```

### Modified

```
config/routes.rb                  # one line, see §4
```

No model changes. No migrations. No serializers needed (response is
plain hash; render directly).

---

## 4. Routing

In `config/routes.rb`, inside the existing
`namespace :admin do … end`, alongside `resources :analytics_events`:

```ruby
get "analytics/summary", to: "analytics_summary#show"
```

This produces `admin_analytics_summary_path` and the URL
`/admin/analytics/summary` — matches what the admin app calls.

---

## 5. Controller

`app/controllers/admin/analytics_summary_controller.rb`:

```ruby
class Admin::AnalyticsSummaryController < Admin::BaseController
  def show
    from = parse_time!(params[:from])
    to   = parse_time!(params[:to])

    render json: AnalyticsSummary::Compute.(from:, to:)
  rescue ArgumentError => e
    render json: { error: { message: e.message } }, status: :bad_request
  end

  private

  def parse_time!(value)
    raise ArgumentError, "from and to are required" if value.blank?

    Time.iso8601(value)
  rescue ArgumentError
    raise ArgumentError, "invalid timestamp: #{value.inspect}"
  end
end
```

Keep it thin — all logic in the command. Don't add caching here unless
benchmarks justify it (see §8).

---

## 6. Command — `AnalyticsSummary::Compute`

`app/commands/analytics_summary/compute.rb`. Follows the existing
Mandate pattern (see `AnalyticsEvent::Search` for shape).

Important constraints to keep this performant:

- One SQL query per metric — no N+1 across companies.
- Use `pluck` and `group(...).count` — don't instantiate models
  unless you need attributes.
- Wrap each metric in a memoized private method so the public `call`
  is just composition.

Skeleton (the API author should treat this as a guide, not a literal
implementation — adjust Arel/SQL to taste):

```ruby
class AnalyticsSummary::Compute
  include Mandate

  AT_RISK_THRESHOLD = 60.days
  TOP_COMPLETED_LIMIT = 10
  AT_RISK_LIMIT = 50

  initialize_with :from, :to

  def call
    {
      range: { from:, to: },
      active_users: active_users,
      active_orgs: active_orgs,
      new_signups: count_event(:user_signed_up),
      new_companies: count_event(:company_created),
      tracked_actions_added: tracked_actions_added,
      tracked_actions_completed: tracked_actions_completed,
      avg_completion_rate: avg_completion_rate,
      status_distribution: status_distribution,
      top_completed_action_types: top_completed_action_types,
      at_risk_orgs: at_risk_orgs,
      events_over_time: events_over_time,
      top_action_types: top_action_types
    }
  end

  private

  def active_users
    {
      dau: distinct_users_since(1.day.ago),
      wau: distinct_users_since(7.days.ago),
      mau: distinct_users_since(30.days.ago)
    }
  end

  def distinct_users_since(t)
    AnalyticsEvent.where("created_at >= ?", t).distinct.count(:user_id)
  end

  def active_orgs
    in_range(AnalyticsEvent).distinct.count(:company_id)
  end

  def count_event(action_type)
    in_range(AnalyticsEvent).where(action_type:).count
  end

  def tracked_actions_added
    in_range(Company::TrackedActionEvent).where(event_type: :created).count
  end

  def tracked_actions_completed
    in_range(Company::TrackedActionEvent).
      where(event_type: :status_changed, status: :completed).count
  end

  def avg_completion_rate
    rates = Company::TrackedAction.group(:company_id).pluck(
      :company_id,
      Arel.sql("COUNT(*) FILTER (WHERE status = 'completed')::float / NULLIF(COUNT(*), 0)")
    )
    return 0.0 if rates.empty?

    values = rates.map(&:last).compact
    return 0.0 if values.empty?

    (values.sum / values.size).round(4)
  end

  def status_distribution
    counts = Company::TrackedAction.group(:status).count
    Company::TrackedAction::STATUSES.index_with { |s| counts[s.to_s] || 0 }
  end

  def top_completed_action_types
    # See §2. v1 fallback: group by polymorphic class name.
    in_range(Company::TrackedActionEvent).
      where(event_type: :status_changed, status: :completed).
      group(:action_type).
      order(Arel.sql("COUNT(*) DESC")).
      limit(TOP_COMPLETED_LIMIT).
      count.
      map { |type, count| { action_type: type, count: } }
  end

  def at_risk_orgs
    threshold = AT_RISK_THRESHOLD.ago

    last_activity = Company::TrackedActionEvent.
      group(:company_id).
      maximum(:created_at)

    candidates = Company::TrackedAction.
      where(status: :not_started).
      group(:company_id).
      count

    Company.where(id: candidates.keys).
      where(deleted_at: nil).
      pluck(:id, :name).
      map { |id, name| {
        company_id: id,
        company_name: name,
        last_activity_at: last_activity[id],
        not_started_count: candidates[id]
      } }.
      select { |row| row[:last_activity_at].nil? || row[:last_activity_at] < threshold }.
      sort_by { |row| -row[:not_started_count] }.
      first(AT_RISK_LIMIT)
  end

  def events_over_time
    counts = in_range(AnalyticsEvent).
      group(Arel.sql("DATE(created_at AT TIME ZONE 'UTC')")).
      count

    # Densify: emit a row for every day in range, even zeros.
    start_date = from.utc.to_date
    end_date   = (to.utc - 1.second).to_date # half-open window
    (start_date..end_date).map do |date|
      { date: date.iso8601, count: counts[date] || 0 }
    end
  end

  def top_action_types
    in_range(AnalyticsEvent).
      group(:action_type).
      order(Arel.sql("COUNT(*) DESC")).
      limit(TOP_COMPLETED_LIMIT).
      count.
      map { |action_type, count| { action_type:, count: } }
  end

  def in_range(scope)
    scope.where("created_at >= ? AND created_at < ?", from, to)
  end
end
```

Notes for the two new metrics:

- `events_over_time`: bucketed by UTC day. The
  `DATE(created_at AT TIME ZONE 'UTC')` cast guarantees stable buckets
  regardless of server timezone — Rails' default
  `Time.zone.today` would shift on a non-UTC server. The densify pass
  is non-negotiable; without it the frontend chart has gaps.
- `top_action_types`: reuses `TOP_COMPLETED_LIMIT` (10). Different
  from `top_completed_action_types`: that one is restricted to
  tracked-action `status_changed → completed` events on the
  `Company::TrackedActionEvent` table; this one is the raw event-name
  leaderboard off `analytics_events`.

Things to double-check during implementation:

- `Company::TrackedAction::STATUSES` is an array of symbols
  (`%i[not_started in_progress completed archived rejected]`); the
  `.group(:status).count` keys come back as **strings** — hence the
  `s.to_s` index. Verify in Rails console.
- `Arel.sql(...)` is needed inside `order` because Rails 8 strict-loading
  rejects raw strings.
- `Time.iso8601` is strict — it needs the `Z` or offset. The admin UI
  sends `new Date().toISOString()` which always includes `Z`, so this
  is fine.

---

## 7. Tests

Existing pattern: `test/controllers/admin/analytics_events_controller_test.rb`.
Uses `Admin::BaseController`'s `guard_admin!` helper, FactoryBot factories
already exist (`:analytics_event`, `:company_tracked_action`,
`:company_tracked_action_event`, `:user :admin`, `:company`).

### Controller test
`test/controllers/admin/analytics_summary_controller_test.rb`:

- `guard_admin! :admin_analytics_summary_path, method: :get` — copy
  the one-liner from the events test.
- `test "GET show returns summary for range"` — seed two events of
  different types in range and one out of range; assert counts and
  the response shape.
- `test "GET show 400s on missing from/to"`.
- `test "GET show 400s on invalid timestamp"`.

### Command test
`test/commands/analytics_summary/compute_test.rb`:

One test per metric is overkill. Group into ~5 cases:

- `test "counts active users in DAU/WAU/MAU windows"` — three events
  on the same user at staggered times; assert dedup.
- `test "counts in-range vs out-of-range events"` — one of each kind
  in/out of range across `new_signups`, `new_companies`,
  `tracked_actions_added`, `tracked_actions_completed`.
- `test "computes avg completion rate skipping zero-action companies"`.
- `test "returns full status distribution with zero defaults"`.
- `test "returns at-risk orgs with stale activity and not_started"`
  — three companies: one fresh, one stale with not_started, one stale
  but all completed; assert only the second is returned.
- `test "events_over_time emits a row for every day in range, including zeros"`
  — seed events on day 1 and day 3 of a 3-day range, assert all three
  dates present with correct counts.
- `test "top_action_types groups by action_type and orders by count desc"`.

Use `travel_to` for timestamp determinism.

---

## 8. Performance / caching

**Skip caching for v1.** The codebase has no `Rails.cache.fetch`
precedent and the queries should be sub-100ms on current data
volumes (low thousands of companies, tens of thousands of events).
Add caching only if a `bin/rails benchmark` style measurement shows
otherwise.

If caching is added later: cache the **whole hash** keyed by
`[from.to_i, to.to_i]` for 60 seconds. Don't cache individual metrics
— the round-trip overhead dominates a single query.

Indexes already in place that this query relies on:

- `analytics_events`: `created_at`, `action_type`, `user_id`, `company_id`.
- `company_tracked_action_events`:
  `company_id`, `(company_id, action_type, action_id, created_at)`,
  `(company_id, action_type, action_id, event_type, created_at)`.
- `company_tracked_actions`: `company_id`, `(company_id, action_type, action_id)`.

`avg_completion_rate` does a full table scan of `company_tracked_actions`
grouped by `company_id` — fine for now, would need an index on
`status` if the table grows past ~1M rows.

---

## 9. Out of scope (don't get drawn into these)

- Sessions / `session_start` / `session_end` events — deferred,
  acknowledged in the proxy note in §1.
- `tier` denormalised onto event rows — not needed for any field in
  this response.
- Aggregate tables (`organisation_plans`, `user_metrics`) — explicit
  Phase 2 work, separate PR. This endpoint must compute live.
- Funnel events (`upgrade_clicked`, `purchase_completed`, etc.) —
  separate PR.

These are tracked in `admin/docs/plan-analytics-api-gaps.md` and
should not bloat this PR.

---

## 10. Acceptance checklist

- [ ] `GET /admin/analytics/summary?from=<iso>&to=<iso>` returns 200
      with the documented shape.
- [ ] All 13 top-level fields populated (incl. `events_over_time` and
      `top_action_types`).
- [ ] Returns 400 for missing/invalid `from`/`to`.
- [ ] Returns 403 for non-admin users (via `Admin::BaseController`).
- [ ] Controller test + command test passing.
- [ ] No new gems, no migrations.
- [ ] `bin/rubocop` clean.

When this lands, the admin UI's `/analytics` page replaces the
"Backend endpoint pending" callouts with live data automatically.
