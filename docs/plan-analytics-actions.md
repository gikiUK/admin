# Actions Analytics — Plan

A chart-first dashboard at `/analytics/actions` to answer "how do users pick and use actions?" The existing event explorer covers row-level inspection — this page exists to surface distributions, funnels, correlations, and trends at a glance.

## Goals & non-goals

**Goals**
- Show adoption, progression, engagement, correlation, and catalog health for actions
- Be chart-first — no tables except for narrow drill-downs
- Read-only over the existing event log; no API behaviour changes for the main app

**Non-goals**
- Not a BI tool. We pre-compute a fixed set of metrics; we do not build ad-hoc query UI
- No new event types in this phase. We exploit what's already emitted
- No changes to `analytics_events` or any endpoint consumed by the main app

## Data sources (read-only)

| Table | Used for |
|---|---|
| `company_tracked_action_events` | Lifecycle events: `created`, `status_changed`, `due_date_changed`, `assignee_changed`, `deleted`. Composite index `(company_id, action_type, action_id, created_at)` makes this fast |
| `company_tracked_actions` | Current-state snapshot (status, assignee, due_date, notes, pre_giki_status) |
| `actions` + `action_data` | Catalog metadata: theme, sector, ghg_categories, sub_themes, industry |
| `companies` | Tier (`subscription_tier`), trial state, membership counts, deletion |
| `analytics_events` | Context-only joins (e.g. `onboarding_question_answered` for correlation slices) |

The two-table pattern (`analytics_events` + `company_tracked_action_events`) means action funnels and completion rates don't need to touch the generic event log.

## Page layout

`/analytics/actions` — top-level tab under the existing Analytics section in the sidebar. Default range: **last 90 days** (actions take weeks to complete — 30 days yields mostly empty funnels). Range selector reuses `presetToRange` (`7d`, `30d`, `90d`, `all`).

Sections, in order:

### 1. Adoption — *which actions get picked?*
- **Leaderboard** — horizontal bar chart, top 20 actions by `tracked_action_created` count in range. Bar color encodes completion rate (red→green) so volume and quality are visible together
- **Theme treemap** — area = adoption count, color = completion rate. Click a tile to filter the rest of the page to that theme (phase 2)
- Toggle: system / custom / both

### 2. Funnel — *what happens after a pick?*
- **Sankey**: `created → in_progress → completed / archived / rejected / stale`
  - `stale` = `in_progress` with no lifecycle event in 60+ days (matches `AT_RISK_THRESHOLD` already used in summary)
- **Time-between distributions** — histograms for created→in_progress and in_progress→completed durations, with median and P90 markers
- KPI strip above the Sankey: total created, completion rate, median time-to-complete

### 3. Correlations — *what predicts completion?*
- **Forest plot**: one row per factor. Dot = lift in completion rate (with-factor minus without-factor), horizontal line = 95% Wilson CI, dot size = `n` of the smaller group. Sorted by absolute lift
- Factors (phase 1):
  - Has assignee
  - Has due date
  - Has notes
  - Tier (premium vs standard)
  - Company size buckets (1, 2-5, 6-20, 20+ members)
- Phase 2 factors:
  - Top 5 most-answered onboarding questions (slice by answer value)
  - Action theme (one row per theme, lift vs catalog mean)

Honest stats: we report rate differences with CIs, not p-values, and we hide rows where the smaller group's n < 30.

### 4. Engagement quality — *are they doing the work?*
- **Scatter**: x = assignee coverage %, y = completion rate %, one dot per action. Hover → action name, sample size. Visual hunt for outliers
- Phase 2: small-multiples of completion rate by company size / tier

### 5. Catalog health — *which actions should we promote, fix, or kill?* (phase 2)
- **Quadrant scatter**: x = adoption count (log), y = completion rate. Quadrant labels: Stars / Niche but effective / Popular but failing / Kill candidates
- **Sparkline strip**: 12-week adoption trend for top 5 risers and top 5 fallers

## API additions

All under `/admin/analytics`, all read-only, all additive. No existing endpoint changes.

### `GET /admin/analytics/actions`
Leaderboard. Query: `from`, `to`, optional `tier`, `sector`, `theme`, `action_type` (system/custom/both).

```json
{
  "range": { "from": "...", "to": "..." },
  "actions": [
    {
      "action_id": 123,
      "action_type": "Action",
      "title": "Switch to LED lighting",
      "theme": "energy",
      "sector": ["manufacturing"],
      "adoption_count": 412,
      "completion_count": 138,
      "completion_rate": 0.335,
      "stale_count": 47,
      "median_time_to_complete_days": 23
    }
  ]
}
```

### `GET /admin/analytics/actions/funnel`
Sankey + duration distributions. Same query params.

```json
{
  "nodes": [{ "id": "created" }, { "id": "in_progress" }, { "id": "completed" }, ...],
  "edges": [{ "from": "created", "to": "in_progress", "count": 820 }, ...],
  "durations": {
    "created_to_in_progress": { "median_days": 4, "p90_days": 21, "histogram": [...] },
    "in_progress_to_completed": { "median_days": 18, "p90_days": 62, "histogram": [...] }
  },
  "kpis": { "created": 1240, "completed": 340, "completion_rate": 0.274, "median_time_to_complete_days": 22 }
}
```

### `GET /admin/analytics/actions/correlations`
Forest-plot rows. Same query params.

```json
{
  "factors": [
    {
      "factor": "has_assignee",
      "label": "Has assignee",
      "with": { "n": 612, "completion_rate": 0.41 },
      "without": { "n": 528, "completion_rate": 0.18 },
      "lift": 0.23,
      "ci_low": 0.18,
      "ci_high": 0.28
    }
  ]
}
```

### `GET /admin/analytics/actions/:id` (phase 2)
Single-action detail: funnel, time-between, top adopting orgs.

### Caching
All four endpoints are read-only, expensive, and admin-only. Wrap responses with `Rails.cache.fetch(key, expires_in: 5.minutes)` keyed by `(endpoint, params)`. Admin doesn't need realtime.

## Frontend structure

```
app/(dashboard)/analytics/actions/
  page.tsx                    # server component, picks range from URL
  adoption-section.tsx
  funnel-section.tsx
  correlations-section.tsx
  engagement-section.tsx
  catalog-health-section.tsx  # phase 2

components/analytics/actions/
  leaderboard-chart.tsx       # recharts horizontal bar with color gradient
  theme-treemap.tsx           # recharts treemap
  funnel-sankey.tsx           # recharts has no sankey; use d3-sankey + custom svg, or a wrapper lib
  duration-histogram.tsx
  forest-plot.tsx             # custom svg, ~80 lines
  engagement-scatter.tsx      # recharts scatter
  quadrant-scatter.tsx        # recharts scatter with quadrant overlay

lib/analytics/actions-api.ts  # typed clients for the four endpoints
```

**Sankey note**: recharts ships no Sankey. Options: `@nivo/sankey` (heaviest), `d3-sankey` + custom SVG (lightest, ~100 lines), or `react-google-charts`. Default to `d3-sankey` + SVG — keeps the bundle clean and matches the custom-chart approach used for activity-chart.

**Forest plot**: no library — it's just dots and lines on a numeric axis. ~80 lines of SVG, much simpler than wiring a library for one chart.

## Build phases

**Phase 1** — highest signal-to-effort. Single PR:
1. Plan doc (this file)
2. Rails: `GET /admin/analytics/actions` (leaderboard)
3. Rails: `GET /admin/analytics/actions/funnel`
4. Rails: `GET /admin/analytics/actions/correlations` (phase-1 factors only)
5. Admin: sidebar entry + `/analytics/actions` route + range picker
6. Adoption section (leaderboard chart only — treemap in phase 2)
7. Funnel section
8. Correlations section
9. Engagement scatter

**Phase 2** — once phase 1 is live and validated:
10. Theme treemap with cross-filter
11. Catalog health (quadrant + sparklines)
12. Phase-2 correlation factors (onboarding, theme)
13. Per-action detail page `/analytics/actions/:id`

## Open questions

- **Stale threshold**: phase 1 reuses the existing `AT_RISK_THRESHOLD = 60.days`. If this looks too lenient in the UI, configurable per-section
- **Custom actions**: leaderboard includes them by default behind a toggle. They share `company_tracked_action_events` rows with `action_type = "Company::CustomAction"`. Group them in the leaderboard under "(custom)" or break out by `Company::CustomAction.theme`? Defer until we see the data
- **Sample-size floor for correlations**: hide rows where smaller group's n < 30. Revisit once we see real volume

## Test plan

- Rails: command-level specs for each new `Analytics::Actions::*` command, asserting structure on a fixture
- Admin: page renders all sections with mocked API responses; date-range presets push correct `from`/`to`; empty-state for each chart
- Manual: visit `/analytics/actions` against staging, sanity-check leaderboard against a known org

## Out of scope

- Anything that requires new event types (e.g. action_viewed, recommendation_shown)
- Per-user action analytics (we have org-level only for v1)
- Export / download
- Sharing or saved views
