# UI Architecture Quick Reference

## Layout Hierarchy
```
app/layout.tsx                    — Root: Outfit font, html/body
  app/(dashboard)/layout.tsx      — Dashboard: AuthProvider > DatasetShell > SidebarProvider
    header                        — Sticky h-12: SidebarTrigger | HeaderSaveStatus | DatasetHeader (pill)
    main                          — Page content (p-6)
  app/login/page.tsx              — Login page (outside dashboard layout)
```

## Provider Stack (inside dashboard)
```
AuthProvider          — checks session, redirects to /login if unauthenticated
  DatasetShell        — wraps DatasetProvider
    SidebarProvider   — shadcn sidebar state
```

## Routes
| Path | Page | Description |
|------|------|-------------|
| `/data/facts` | Facts table | Grouped by category, expandable rows |
| `/data/facts/[id]` | Fact detail | Edit individual fact |
| `/data/questions` | Questions | Threaded view with nesting |
| `/data/questions/[index]` | Question detail | Edit individual question |
| `/data/constants` | Constants | Grouped constant tables |
| `/data/raw` | Raw JSON | JSON explorer/viewer |
| `/login` | Login | Email/password auth |

## Key Components

### Header (`components/dataset/`)
- `dataset-header.tsx` — Dynamic Island pill (Draft/Live mode + Review/Discard buttons)
- `header-save-status.tsx` — "Syncing.../Synced" indicator with CloudCheck icon + tooltip
- `review-dialog.tsx` — Modal with Review tab (diff cards) + Activity tab (change timeline)

### Sidebar (`components/app-sidebar.tsx`)
- "Giki Admin" branding
- Collapsible "Data" section: Facts, Questions, Constants, Raw JSON
- Footer: logout button

### Data Pages Pattern
- `page.tsx` — server component, just renders client component
- Client component uses `useDataset()` to get `blob` (DatasetData)
- Computes enriched/derived data (e.g. `computeEnrichedFacts()`, `computeQuestionThread()`)
- Renders tables/lists with inline editing

### Facts Page (`components/facts/`)
- `facts-table.tsx` — main table, groups by FactCategory
- `fact-row.tsx` — expandable row showing relationships
- `fact-detail-panel.tsx` — detail editor for single fact
- Uses `computeEnrichedFacts()` from `lib/blob/derived.ts`

### Questions Page (`components/questions/`)
- `questions-panel.tsx` — threaded view
- `question-thread.tsx` — recursive tree of ThreadNode
- `question-card.tsx` — individual question display
- `question-detail-panel.tsx` — detail editor
- `question-facts-display.tsx` — shows linked facts as badges
- Uses `computeQuestionThread()` from `lib/blob/derived.ts`

### Constants Page (`components/constants/`)
- `constants-panel.tsx` — grouped tables of constant values
- Inline editing with toggle/add/delete

### Shared Components
- `components/page-header.tsx` — reusable page title + optional action
- `components/ui/` — shadcn/ui vendored components

## Server vs Client Boundaries
- Layout: server component (wraps client providers)
- Pages: server components that render client components
- All data-interactive components: "use client" (need useDataset hook)
- No server-side data fetching for dataset — all client-side via API

## Derived/Computed Data (`lib/blob/derived.ts`)
- `computeEnrichedFacts(data)` → FactCategory[] with relationships
- `computeQuestionThread(data)` → ThreadNode[] tree
- `countActionRefs(data)` → Record<string, number> (fact → action count)
- `assignCategory(factId)` → category string (from `lib/data/fact-categories.ts`)
