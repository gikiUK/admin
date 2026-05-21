# Insights — Plan

Two new admin pages — **Facts Insights** and **Plan Insights** — sharing a single cohort-builder. Both read-only over existing data, additive Rails endpoints only.

## Goals & non-goals

**Goals**
- Define a cohort of orgs by org fields + fact answers
- See aggregated fact values and aggregated plan-action metadata for that cohort
- Per-row CSV export for offline pivoting
- Reuse one cohort spec across both pages

**Non-goals**
- Pivot tables / cross-tabs in UI — CSV handles that
- Saved cohorts, cohort sharing, two-cohort comparison — phase 3
- Time-series of cohorts (e.g. monthly signups) — phase 3
- Changing existing main-app endpoints

## Page placement

Two new entries under the Analytics group in the sidebar:
- `/analytics/insights/facts` — **Facts insights**
- `/analytics/insights/plan` — **Plan insights**

Both pages render a shared `<CohortBuilder>` at the top, then page-specific charts below. Cohort state is in the URL (`?cohort=<base64-or-querystring>`) so the same cohort survives across tabs and refreshes.

## The cohort builder

One component, used by both pages. Composes a `CohortSpec`:

```ts
type CohortSpec = {
  org_filters: {
    tier?: ("standard" | "premium")[];
    subscription_status?: string[];
    tags_include?: string[];        // any-of
    tags_exclude?: string[];        // none-of  (use "qa" here to filter out test orgs)
    workshop_ids?: number[];        // any-of attendance
    signed_up_from?: string;
    signed_up_to?: string;
    has_tracked_actions?: boolean;
  };
  fact_filters: Array<{
    key: string;                    // company_answers.key
    values: unknown[];              // any-of; treated as "contains any" for multi-value facts
  }>;
};
```

All filters AND together at the cohort level. Within `fact_filters[i].values` it's any-of (matches the doc).

UI elements:
- Tier — multi-checkbox
- Subscription status — multi-checkbox
- Tags — combobox with multi-select for **include** AND multi-select for **exclude** (default `qa` in exclude — see QA section)
- Workshops — typeahead, multi-select
- Signup date range — two date inputs
- "Has any tracked actions" — three-state toggle (any / yes / no)
- Fact filter rows — "Add fact filter" button → pick a question from the live dataset → its answer options (single or multi depending on question type)

Shows a live "Cohort: 247 organisations" count under the panel as filters change (debounced).

## QA / test-org handling

Use the existing `companies.tags` text[]. Convention:
- Internal/test orgs tagged `qa`
- Client orgs tagged `client` (optional; lets us flip the default to "only show clients")

**The cohort builder defaults `tags_exclude: ["qa"]`** on first load. User can clear it. We add a manage UI later if we need to retro-tag; for v1, manually tag test orgs.

Documented as a future improvement: optional `companies.qa` boolean column if tags-as-flags becomes painful.

## Endpoints (all additive, all admin-namespaced)

All four endpoints take the same `CohortSpec` as a JSON body. POST not GET because:
- Specs can grow long (workshop_ids, fact_filters)
- It's read-only despite POST — admin-only, no side effects
- Matches `Analytics::Organization::Search` style which already accepts complex params

### `POST /admin/analytics/insights/cohort_summary`
Always-on KPI strip. Computes cheap-to-query org-level counts.

```json
{
  "cohort_size": 247,
  "total_orgs_in_db": 1840,
  "tier_breakdown": { "standard": 200, "premium": 47 },
  "tracked_actions": { "total": 3120, "avg_per_org": 12.6, "median_per_org": 8 },
  "with_any_actions": 198,
  "with_completed_actions": 89
}
```

### `POST /admin/analytics/insights/facts/breakdown`
For Facts Insights chart grid. Request body adds `fact_keys: string[]` — which facts to break down.

```json
{
  "cohort_size": 247,
  "breakdowns": [
    {
      "key": "size",
      "type": "single_select",
      "values": [
        { "value": "small", "count": 130, "share": 0.526 },
        { "value": "medium", "count": 90, "share": 0.364 },
        { "value": "large", "count": 20, "share": 0.081 },
        { "value": null, "count": 7, "share": 0.028 }
      ]
    },
    {
      "key": "industries",
      "type": "multi_select",
      "note": "Orgs may appear in multiple buckets; sums exceed cohort size",
      "values": [
        { "value": "manufacturing", "count": 78, "share": 0.316 },
        { "value": "transportation", "count": 42, "share": 0.170 }
      ]
    }
  ]
}
```

### `POST /admin/analytics/insights/plan/breakdown`
For Plan Insights chart grid. Request body adds:
- `metadata_keys: string[]` — which action metadata fields to break down (e.g. `["impact_opportunity", "ghg_scope"]`)
- `include_custom: boolean` (default false)
- `pre_giki_filter: "all" | "already_doing" | "previously_done" | "none"`
- `status_filter: string[]` — optional restrict to certain `Company::TrackedAction.status` values

```json
{
  "cohort_size": 247,
  "kpis": {
    "total_actions": 3120,
    "avg_actions_per_org": 12.6,
    "total_recommendations": 18400,
    "actions_by_status": { "not_started": 1200, "in_progress": 800, "completed": 920, "archived": 110, "rejected": 90 }
  },
  "breakdowns": [
    {
      "key": "impact_opportunity",
      "type": "single_select",
      "values": [
        { "value": "small", "count": 1100, "share": 0.353 },
        { "value": "medium", "count": 1300, "share": 0.417 },
        { "value": "large", "count": 600, "share": 0.192 },
        { "value": "transformative", "count": 80, "share": 0.026 }
      ]
    },
    {
      "key": "ghg_categories",
      "type": "multi_select",
      "note": "Actions may appear in multiple categories; sums exceed total_actions",
      "values": [
        { "value": "cat_1", "count": 420, "share": 0.135 },
        { "value": "cat_2", "count": 380, "share": 0.122 }
      ]
    }
  ]
}
```

### `POST /admin/analytics/insights/facts/export` — CSV
Streamed CSV (text/csv). One row per org. Columns:
- Org fields: `id, name, signed_up_at, subscription_tier, subscription_status, tags, workshop_titles`
- Fact answers: one column per fact `key` present in the cohort. Multi-value facts joined with `|`.

### `POST /admin/analytics/insights/plan/export` — CSV
One row per `Company::TrackedAction` (filtered per `include_custom` + `pre_giki_filter` + `status_filter`). Columns:
- Org columns (same as above)
- Action columns: `action_id, action_type, action_title, theme, category, impact_opportunity, cost_saving_potential, business_growth_potential, implementation_time_est, payback_est, ghg_scope (pipe-joined), ghg_categories (pipe-joined), sub_themes (pipe-joined)`
- Tracked-action columns: `status, pre_giki_status, assignee_name, due_date, notes, created_at`

Custom actions get blanks for the metadata they don't carry; the columns are still there for shape consistency.

## "Total recommendations" — how it's computed

`FactsEngine::ClassifyActionIds.(company)` per org. Slow at scale (one rules-engine run per org).

V1 strategy: compute on demand inside `cohort_summary`. Two safeguards:
- Cap cohort size for KPI computation at e.g. 1000 orgs; show `total_recommendations: null` with a `"recommendations_skipped": "cohort_too_large"` flag if over
- The KPI is only computed for Plan Insights, not Facts Insights

V2 (deferred): cache result per `(company_id, facts_dataset.live.id)`; invalidate on publish.

## Charts

**Facts Insights page** (chart-first per `feedback_charts_over_tables.md`):
- KPI strip (4–5 stat tiles): cohort size, tier breakdown share, % with tracked actions, % onboarded
- Default fact chart grid: `size`, `industries`, `measures_emissions`, `has_reduction_targets`, `signed_up_at` (binned by month). User can add/remove via "Add fact" combobox
- Each chart: horizontal bar by default. Switches to pie if ≤ 5 values. Multi-value facts get an info chip explaining double-counting
- CSV download button in the page header

**Plan Insights page**:
- KPI strip: cohort size, total actions, avg actions/org, total recommendations, completion rate
- Stacked bar: actions by status, segmented by selected metadata field (the user picks `impact_opportunity`, `ghg_scope`, etc. from a dropdown) — this is the doc's example chart shape
- Free-standing breakdown charts below for `theme`, `ghg_categories`, `sub_themes`, `pre_giki_status`
- Toggle: "Include custom actions" (default off)
- Filters: `status` (multi), `pre_giki_status` (all / not pre-giki / already_doing / previously_done)
- CSV download button

## Frontend structure

```
app/(dashboard)/analytics/insights/
  layout.tsx                          # wraps both pages, mounts CohortProvider
  facts/page.tsx
  plan/page.tsx

components/analytics/insights/
  cohort-builder.tsx                  # the big shared panel
  cohort-filter-rows/
    tier-filter.tsx
    status-filter.tsx
    tags-filter.tsx
    workshop-filter.tsx
    signup-range-filter.tsx
    fact-filter-row.tsx
  facts-breakdown-grid.tsx
  fact-breakdown-chart.tsx            # one chart per fact (bar or pie)
  plan-status-stacked-bar.tsx         # the headline chart per the doc
  plan-metadata-breakdown-grid.tsx
  insights-kpi-strip.tsx
  csv-download-button.tsx             # generic streamed-CSV trigger

lib/analytics/insights/
  cohort-spec.ts                      # CohortSpec type + URL encoding/decoding
  insights-api.ts                     # typed clients for the 4 endpoints
  use-cohort-summary.ts
  use-facts-breakdown.ts
  use-plan-breakdown.ts
```

`<CohortProvider>` lives at the `layout.tsx` level — both pages read the same cohort and request a refetch when it changes.

## Build phases

**Phase 1 — Facts Insights end-to-end**
1. Plan doc (this)
2. CSV download utility (`csv-download-button.tsx` + Rails streaming pattern) — shared
3. Rails: `cohort_summary` endpoint
4. Rails: `facts/breakdown` endpoint
5. Rails: `facts/export` endpoint
6. Admin: nav + `/analytics/insights/facts` route + layout + CohortProvider
7. Admin: `<CohortBuilder>` (org filters first; fact filters next)
8. Admin: `<InsightsKpiStrip>`
9. Admin: `<FactsBreakdownGrid>` with add-fact combobox
10. Admin: CSV download wired

**Phase 2 — Plan Insights**
11. Rails: `plan/breakdown` endpoint
12. Rails: `plan/export` endpoint
13. Admin: `/analytics/insights/plan` route
14. Admin: status-stacked-bar (the doc's headline chart)
15. Admin: `<PlanMetadataBreakdownGrid>` with metadata picker
16. Admin: custom-action toggle, pre-giki filter, status filter

**Phase 3 (out of scope)**
- Recommendations caching
- Saved cohorts / sharing
- Two-cohort comparison
- Time-series cohorts
- Optional `companies.qa` boolean if the tags convention breaks down

## Test plan

**Rails command-level tests** for each new `Analytics::Insights::*` command:
- Cohort builder filters: tier, tags include/exclude, workshop attendance, signup range, fact filter (single + multi-value)
- Multi-value fact filter: "contains any of" semantics
- KPI math: avg vs median actions per org
- Breakdown buckets: null/missing values bucketed correctly
- Custom action exclusion in plan breakdowns
- CSV: column order, multi-value pipe-joining, empty-value safety

**Admin smoke tests**:
- Page renders with empty cohort
- CohortBuilder filter changes update URL
- Both pages share the same cohort across tabs
- CSV download triggers correct content-disposition

## Open questions to revisit during build

- **Cohort size cap for `total_recommendations`** — 1000 feels right but is a guess. Worth measuring once we hit a real dataset
- **Fact filter UI for booleans-with-unknown** — `boolean_state` facts have `true`/`false`/`"unknown"`. Multi-select chip group should expose all three
- **Date-bin granularity for `signed_up_at`** chart — week / month / quarter? Default month, switchable later
- **Workshop multi-select** — need to fetch workshops list. Cached endpoint or inline in cohort-summary response?

## Notes for future-me

- `company_answers.key` is a string — use the live dataset for labels but **never** filter UI options by what the dataset says exists. Always source available filter-keys from `DISTINCT key` in `company_answers` so renamed/deleted questions still surface old data.
- Both pages should use the same date-bucket library as the Actions dashboard if we add time-series later (consistency over reinvention).
