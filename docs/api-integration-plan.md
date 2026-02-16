# API Integration Plan — Facts Datasets

## Context

The admin UI currently uses a **mock data layer** that reads JSON files from `../facts/data/` on disk, seeds them into an in-memory store, and serves them through Next.js server actions. The Rails API at `../api` now has a fully implemented FactsDataset backend (PR #28) that stores the same data as a JSONB blob in Postgres with a draft/live/archived workflow.

This plan replaces the mock layer with real API calls while preserving all existing UI components and client-side state management.

## What the API provides

### Endpoints (routes.rb)

```
GET    /admin/facts_datasets/live          → live dataset (404 if none)
GET    /admin/facts_datasets/draft         → current draft (404 if none)
POST   /admin/facts_datasets/draft         → create draft from live (returns existing if one exists)
PATCH  /admin/facts_datasets/draft         → update draft data + test_cases (locked write, validated)
DELETE /admin/facts_datasets/draft         → delete draft
POST   /admin/facts_datasets/draft/publish → promote draft to live, archive old live

GET    /admin/actions                      → all actions (id, title, enabled)
GET    /admin/actions/:id                  → single action
POST   /admin/actions                      → create action
PATCH  /admin/actions/:id                  → update action
```

### Auth

`Admin::BaseController` requires `authenticate_user!` + `ensure_admin!`. The API uses Devise session-based auth with cookies (`ActionController::Cookies` included). The admin FE must send session cookies with every request.

### Response shapes

**FactsDataset:**
```json
{
  "facts_dataset": {
    "id": 1,
    "status": "live" | "draft",
    "data": { "facts": {...}, "questions": [...], "rules": [...], "constants": {...}, "action_conditions": {...} },
    "test_cases": [...]
  }
}
```

**Errors:**
```json
{ "error": { "type": "facts_dataset_not_found", "message": "..." } }
```

**Actions list:**
```json
{ "actions": [{ "id": 1, "title": "...", "enabled": true }, ...] }
```

### Key data differences (API blob vs current FE types)

| Aspect | Current FE (`types.ts`) | API blob (from seed/factory) |
|--------|------------------------|------------------------------|
| Soft-delete field | `discarded?: boolean` | `enabled: boolean` |
| Constants location | Separate file, separate page, not in `DatasetData` | Inside blob: `data.constants` |
| Condition values | String references (`"Advertising"`) | Numeric IDs (`1`) |
| Action conditions | `include_when` + `exclude_when` only | + `enabled`, `dismiss_options` |
| Fact fields | `category` (FE-computed), no `enabled` | `enabled: true`, no `category` in some entries |
| Question/Rule fields | No `enabled` | `enabled: true` |
| `DatasetMeta` | `{ id: string, status, created_at, updated_at }` | `{ id: number, status }` (no timestamps from serializer) |

## Integration approach

### Guiding principle

The FE already has the right architecture: load blob → edit locally → save full blob back. The mock store is a thin seam. We replace only the data transport layer and adapt types to match the real API shape.

### What changes, what stays

**Changes:**
1. `lib/blob/api-client.ts` — real `fetch()` calls instead of server action wrappers
2. `lib/blob/actions.ts` — remove or gut (no longer needed as server action layer)
3. `lib/blob/types.ts` — adapt to match API blob structure (`enabled` instead of `discarded`, add `constants`)
4. `lib/blob/dataset-context.tsx` — draft/live awareness (load draft if exists, else live)
5. `lib/blob/dataset-mutations.ts` — use `enabled` flag instead of `discarded`
6. `lib/blob/seed.ts` + `lib/blob/mock-store.ts` — delete (no longer needed)
7. `lib/data/constants.ts` — delete or repurpose (constants come from blob)
8. Constants page — rewrite to read/edit constants from blob, not separate file
9. Components referencing `discarded` — update to use `enabled`
10. New: draft/live workflow UI (create draft, publish, delete draft)
11. New: Auth layer (login, session management)

**Stays unchanged:**
- All page components (facts, questions detail pages)
- `dataset-reducer.ts` structure (just field name changes)
- `change-log.ts`, `dataset-diff.ts` (logic stays, field names adapt)
- `derived.ts` (enrichment logic)
- All UI components (fact cards, question cards, condition display, etc.)
- Sidebar, layout, page-header

---

## Step-by-step plan

### Step 0: Environment setup

**Add API base URL config:**
- Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3000` (Rails default port)
- Add `NEXT_PUBLIC_API_URL` to `next.config.ts` if needed for server-side usage
- Document in README

### Step 1: Align types with API blob (`lib/blob/types.ts`)

**`discarded` → `enabled` everywhere:**
- `BlobFact`: remove `discarded?: boolean`, add `enabled: boolean`
- `BlobQuestion`: same
- `BlobRule`: same
- `BlobActionCondition`: same, add `dismiss_options` field

**Add `constants` to `DatasetData`:**
```ts
export type BlobConstantValue = {
  id: number;
  name: string;
  label?: string;
  description: string | null;
  enabled: boolean;
};

export type DatasetData = {
  facts: Record<string, BlobFact>;
  questions: BlobQuestion[];
  rules: BlobRule[];
  constants: Record<string, BlobConstantValue[]>;
  action_conditions: Record<string, BlobActionCondition>;
};
```

**Align `DatasetMeta`:**
```ts
export type DatasetMeta = {
  id: number;
  status: DatasetStatus;
};
```

(Drop `created_at` / `updated_at` — API serializer doesn't send them. Add back if serializer is updated.)

**Condition types — add numeric array support:**
```ts
export type SimpleCondition = Record<string, string | boolean | number | number[] | string[]>;
```

### Step 2: Replace API client (`lib/blob/api-client.ts`)

Replace the current 14-line file with real fetch calls:

```ts
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",       // send session cookie
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error?.type, body.error?.message);
  }
  return res.json();
}
```

**Dataset functions:**
```ts
export async function loadLiveDataset(): Promise<Dataset> { ... }
export async function loadDraftDataset(): Promise<Dataset | null> { ... }
export async function createDraft(): Promise<Dataset> { ... }
export async function saveDraft(blob: DatasetBlob): Promise<Dataset> { ... }
export async function deleteDraft(): Promise<void> { ... }
export async function publishDraft(): Promise<Dataset> { ... }
```

**Actions functions:**
```ts
export async function loadActions(): Promise<Action[]> { ... }
```

### Step 3: Update mutations (`lib/blob/dataset-mutations.ts`)

All `DISCARD_*` actions become `DISABLE_*` (or keep the name but toggle `enabled` instead of `discarded`):
- `DISCARD_FACT` → sets `enabled: false` (was `discarded: true`)
- `RESTORE_FACT` → sets `enabled: true` (was `discarded: false`)
- Same for questions, rules

The simplest approach: keep the action names but change the implementation:
```ts
case "DISCARD_FACT": {
  const fact = data.facts[action.id];
  if (!fact) return data;
  return { ...data, facts: { ...data.facts, [action.id]: { ...fact, enabled: false } } };
}
```

### Step 4: Update dataset context & reducer for draft/live workflow

**New state fields:**
```ts
export type DatasetState = {
  live: Dataset | null;        // the live dataset (read-only baseline)
  draft: Dataset | null;       // the working draft (editable)
  dataset: Dataset | null;     // currently active — either draft or live
  original: DatasetData | null;
  changeLog: ChangeEntry[];
  isDirty: boolean;
  saving: boolean;
  draftStatus: "loading" | "none" | "active" | "creating" | "publishing";
};
```

**New reducer actions:**
```ts
| { type: "LOAD_LIVE"; payload: Dataset }
| { type: "LOAD_DRAFT"; payload: Dataset | null }
| { type: "DRAFT_CREATED"; payload: Dataset }
| { type: "DRAFT_DELETED" }
| { type: "DRAFT_PUBLISHED"; payload: Dataset }
```

**Loading sequence in `DatasetProvider`:**
1. Fetch live dataset
2. Fetch draft dataset (may 404 → null)
3. If draft exists, set as active (editing mode)
4. If no draft, show live (read-only mode)

### Step 5: Update `useDataset` hook

New operations exposed:
```ts
return {
  // existing
  dataset, blob, dispatch, isDirty, saving, save, changeLog, original,
  undoChange, undoAll, revertField,
  // new
  live,                    // live dataset
  draft,                   // draft dataset (or null)
  isEditing,               // draft is active
  draftStatus,             // loading state
  createDraft: async () => {...},
  deleteDraft: async () => {...},
  publishDraft: async () => {...},
};
```

`save()` now calls `saveDraft()` (PATCH) instead of the mock store.

### Step 6: Delete mock data layer

Remove:
- `lib/blob/mock-store.ts`
- `lib/blob/seed.ts`
- `lib/blob/actions.ts` (the server actions file — not to be confused with action_conditions)
- `lib/data/constants.ts` (constants now come from blob)
- `lib/data/facts.ts`, `lib/data/questions.ts`, `lib/data/rules.ts` (if they exist and are unused)
- `lib/data/fact-categories.ts` (category assignment — may keep if FE still computes categories)

Audit: check what `lib/data/` files are still imported anywhere. Some may be used by derived.ts or enrichment logic.

### Step 7: Update all UI references from `discarded` to `enabled`

**Components to update** (grep for `discarded`):
- `components/facts/fact-card.tsx` — `fact.discarded` → `!fact.enabled`
- `components/questions/question-card.tsx` — `q.discarded` → `!q.enabled`
- `components/dataset/review-dialog.tsx` — diff kind `discarded` → `disabled` (semantic only)
- `lib/blob/dataset-diff.ts` — diff detection logic
- `lib/blob/change-log.ts` — description generation
- Any editor components that set `discarded`

### Step 8: Update constants page

The constants page currently has its own standalone data pipeline (`lib/api/constants.ts` → server actions → ConstantsEditor). Constants are now inside the blob.

**Approach:** Make the constants page use `useDataset()` like facts and questions do:
- Read constants from `blob.constants`
- Edits go through the reducer (new mutation actions: `SET_CONSTANT_VALUE`, `ADD_CONSTANT_VALUE`, `DISABLE_CONSTANT_VALUE`)
- Saved with the rest of the blob when the admin clicks Save

**Remove:**
- `lib/api/constants.ts`
- `app/(dashboard)/data/constants/actions.ts` (server actions)

### Step 9: Draft/live workflow UI

**DatasetHeader updates:**
- When viewing **live** (no draft): show "Start editing" button → calls `createDraft()`
- When viewing **draft**: show change count + "Review" button (existing), plus "Discard draft" button
- Review dialog: "Publish" button now calls `publishDraft()` (not `save()`)
- Add separate "Save draft" button for saving work-in-progress without publishing

**New UI states:**
- Banner/indicator showing "You're editing a draft" vs "Viewing live data"
- Confirmation dialog for "Discard draft" and "Publish"

### Step 10: Auth integration

The API uses Devise session auth with cookies. Options:

**Option A: Proxy through Next.js API routes (recommended)**
- Create `app/api/[...proxy]/route.ts` that forwards requests to the Rails API
- Next.js handles CORS/cookies automatically
- FE calls `/api/admin/facts_datasets/live` → Next.js proxies to Rails
- Session cookie managed by the browser

**Option B: Direct cross-origin requests**
- Configure Rails CORS to allow the admin domain
- Set `credentials: "include"` on all fetch calls
- Requires Rails `config.hosts` and CORS middleware setup

**Option C: Token-based auth**
- Admin FE gets a JWT/API token on login
- Send as `Authorization: Bearer <token>` header
- Requires API changes (not yet implemented)

**Recommendation:** Start with Option A (proxy) for simplicity. It avoids CORS entirely and keeps auth transparent. Can move to Option B/C later.

**Login flow:**
- Add a login page at `/login`
- POST `/auth/login` with email + password
- Handle 2FA if the user has it enabled
- Store auth state in a context or cookie
- Redirect to dashboard on success

### Step 11: Error handling

**API error wrapper:**
```ts
class ApiError extends Error {
  constructor(
    public status: number,
    public errorType: string,
    public serverMessage?: string,
  ) {
    super(serverMessage ?? `API error: ${errorType}`);
  }
}
```

**Handle in `useDataset`:**
- 404 on draft → no draft exists (not an error)
- 404 on live → show "No dataset exists" state
- 401/403 → redirect to login
- 422 → show validation errors from API
- Network errors → toast notification

### Step 12: Update tests

- Remove tests that depend on filesystem reads or mock store
- Add tests for the new API client functions (mock fetch)
- Update component tests that check for `discarded` → `enabled`
- Add integration test for draft/live flow

---

## Migration checklist

### Files to create
| File | Purpose |
|------|---------|
| `.env.local` | API URL config |
| `lib/api/client.ts` | Base API client with fetch wrapper |
| `lib/api/facts-datasets.ts` | Dataset-specific API calls |
| `lib/api/actions.ts` | Action metadata API calls |
| `app/api/[...proxy]/route.ts` | Proxy to Rails API (if using Option A) |
| `app/login/page.tsx` | Login page |
| `lib/auth/auth-context.tsx` | Auth state management |

### Files to modify
| File | Changes |
|------|---------|
| `lib/blob/types.ts` | `discarded` → `enabled`, add `constants` to `DatasetData`, add `BlobConstantValue` |
| `lib/blob/api-client.ts` | Replace mock calls with real fetch |
| `lib/blob/dataset-context.tsx` | Draft/live loading, new provider logic |
| `lib/blob/dataset-reducer.ts` | New actions for draft lifecycle, `enabled` logic |
| `lib/blob/dataset-mutations.ts` | `discarded` → `enabled` in all mutations |
| `lib/blob/use-dataset.ts` | New draft/live operations |
| `lib/blob/change-log.ts` | Update descriptions for `enabled`/`disabled` |
| `lib/blob/dataset-diff.ts` | Update diff detection for `enabled` |
| `components/facts/fact-card.tsx` | `discarded` → `!enabled` |
| `components/questions/question-card.tsx` | `discarded` → `!enabled` |
| `components/dataset/dataset-header.tsx` | Draft/live workflow buttons |
| `components/dataset/review-dialog.tsx` | Publish vs Save distinction |
| `app/(dashboard)/data/constants/page.tsx` | Read from blob instead of separate API |

### Files to delete
| File | Reason |
|------|--------|
| `lib/blob/mock-store.ts` | Replaced by real API |
| `lib/blob/seed.ts` | No longer seeding from disk |
| `lib/blob/actions.ts` | Server actions no longer needed |
| `lib/api/constants.ts` | Constants in blob now |
| `lib/data/constants.ts` | Constants in blob now |
| `app/(dashboard)/data/constants/actions.ts` | Server actions for old constants API |

---

## Suggested implementation order

1. **Types first** (Step 1) — align types, fix all compile errors from `discarded` → `enabled`
2. **API client** (Step 2) — build the real fetch layer
3. **Delete mock layer** (Step 6) — remove seed, mock-store, server actions
4. **Update mutations + reducer** (Steps 3-4) — adapt state management
5. **Update hook** (Step 5) — expose new operations
6. **UI field updates** (Step 7) — grep and fix all `discarded` references
7. **Constants migration** (Step 8) — move constants into blob flow
8. **Draft/live UI** (Step 9) — workflow buttons and status indicators
9. **Auth** (Step 10) — login page, proxy, session management
10. **Error handling** (Step 11) — proper error states and toasts
11. **Tests** (Step 12) — clean up and add new

Steps 1-6 can be done in a single pass (they're tightly coupled). Steps 7-8 are medium effort. Steps 9-11 are the meatiest new feature work.

## Open questions

1. **Auth approach** — Proxy (Option A) vs direct CORS (Option B)? Proxy is simpler to start but adds a dependency.
2. **Category field** — The FE currently computes `category` for facts via `assignCategory()`. The API seed adds it to some facts but not consistently. Should categories live in the blob or stay FE-computed?
3. **Timestamps** — The API serializer doesn't return `created_at`/`updated_at`. Should it? The FE type currently expects them.
4. **`dismiss_options`** — The API blob includes `dismiss_options` on action conditions. The FE type doesn't have this field. Add it now or when we build the actions editor?
5. **API port** — Rails defaults to 3000, admin is on 3020. Confirm this setup.
6. **Read-only live view** — Should the admin be able to browse live data without creating a draft? Current mock always loads as live/editable. The real workflow has distinct live (read-only) and draft (editable) states.
