# Giki Admin Dashboard - Facts & Questions UI

## Context

Building the first iteration of the Giki Admin dashboard to replace Airtable for managing facts and questions data. The data model lives in the sibling `../facts` repo as JSON files. This iteration focuses on **read-only listing** of Facts and Questions with search/filter, using a sidebar layout that can grow to include Actions, Rules, and Constants later.

Data is loaded directly from the filesystem (mock approach) with a clean seam for swapping to API calls later.

## Implementation Steps

### Step 1: Install shadcn/ui components

```bash
npx shadcn@latest add sidebar input badge table select separator tooltip breadcrumb
```

Then fix formatting: `pnpm run check:fix`

### Step 2: TypeScript types for the data model

**Create `lib/data/types.ts`**

Define types matching the JSON structures:
- `FactType` = `"boolean_state" | "enum" | "array"`
- `FactDefinition` — id, type, core, valuesRef?, values?
- `QuestionType` = `"boolean_state" | "single-select" | "multi-select" | "checkbox-radio-hybrid"`
- `Question` — index, type, label, description?, fact?, facts? (for checkbox-radio-hybrid), options?, optionsRef?, showWhen?, hideWhen?, unknowable?
- `Condition` — `SimpleCondition | AnyCondition` for show_when/hide_when

### Step 3: Data loaders

**Create `lib/data/constants.ts`** — reads `../facts/data/constants.json`
**Create `lib/data/facts.ts`** — reads `../facts/data/facts.json`, transforms map → array with id embedded, resolves `values_ref` from constants
**Create `lib/data/questions.ts`** — reads `../facts/data/questions.json`, transforms to typed array with index, camelCases keys (show_when → showWhen)

All use `readFileSync` from `node:fs`. Path: `resolve(process.cwd(), "..", "facts", "data")`.

### Step 4: Dashboard layout with sidebar

**Create `components/app-sidebar.tsx`** (client component)
- Uses shadcn/ui Sidebar primitives
- "Data" collapsible group with "Facts" and "Questions" nav items
- Active item highlighted via `usePathname()`
- Lucide icons: Database for Facts, FileQuestion for Questions

**Create `app/(dashboard)/layout.tsx`**
- SidebarProvider wrapping AppSidebar + SidebarInset
- Header bar with SidebarTrigger + Breadcrumb
- Main content area with padding

**Create `components/page-header.tsx`**
- Reusable: title, description, optional action slot

### Step 5: Update home page

**Modify `app/page.tsx`** — redirect to `/data/facts`

### Step 6: Facts page

**Create `app/(dashboard)/data/facts/page.tsx`** (server component)
- Calls `loadFacts()`, passes to FactsTable

**Create `components/facts/facts-table.tsx`** (client component)
- Search input (filters by fact id)
- Filter dropdowns: type (boolean_state/enum/array), core/derived
- Table columns: ID, Type (badge), Core/Derived (badge), Values
- Count display: "Showing X of Y facts"

### Step 7: Questions page

**Create `app/(dashboard)/data/questions/page.tsx`** (server component)
- Calls `loadQuestions()`, passes to QuestionsTable

**Create `components/questions/questions-table.tsx`** (client component)
- Search input (filters by label text)
- Filter dropdown: question type
- Table columns: #, Label, Type (badge), Fact(s), Show When, Hide When
- Conditions rendered as readable text (e.g. "leases_buildings = true")

**Create `components/questions/condition-display.tsx`**
- Renders Condition objects as readable inline badges/text
- Handles simple `{fact: value}` and `{any: [...]}` forms

### Step 8: Update tests

- Update `tests/sanity.test.tsx` for the redirect behavior
- Add `tests/data/facts.test.ts` — validates loadFacts returns correct structure/count
- Add `tests/data/questions.test.ts` — validates loadQuestions returns correct structure/count

## Files to Create/Modify

| File | Action |
|------|--------|
| `lib/data/types.ts` | Create |
| `lib/data/constants.ts` | Create |
| `lib/data/facts.ts` | Create |
| `lib/data/questions.ts` | Create |
| `components/app-sidebar.tsx` | Create |
| `components/page-header.tsx` | Create |
| `app/(dashboard)/layout.tsx` | Create |
| `app/(dashboard)/data/facts/page.tsx` | Create |
| `app/(dashboard)/data/questions/page.tsx` | Create |
| `components/facts/facts-table.tsx` | Create |
| `components/questions/questions-table.tsx` | Create |
| `components/questions/condition-display.tsx` | Create |
| `app/page.tsx` | Modify (redirect) |
| `tests/sanity.test.tsx` | Modify |
| `tests/data/facts.test.ts` | Create |
| `tests/data/questions.test.ts` | Create |

## Verification

1. `pnpm run dev` — sidebar renders, navigation works between Facts and Questions
2. Facts page shows 63 facts with working search and filters
3. Questions page shows 27 questions with conditions displayed
4. `pnpm run check` — passes Biome checks
5. `npx tsc --noEmit` — passes type checking
6. `pnpm run test` — all tests pass

## Future Phases

### Phase 2: Actions, Rules, Constants
Add remaining data sections under the sidebar "Data" group.

### Phase 3: Editing & API Integration
- Searchable facts widget for setting show_when/hide_when on questions
- Fact rules editor
- Actions editor (title + derived facts)
- Constants editor
- Replace filesystem reads with real API calls
