# State Management Quick Reference

## File Map
| File | Purpose |
|------|---------|
| `lib/blob/dataset-context.tsx` | React Context + Provider, loads live/draft on mount |
| `lib/blob/dataset-reducer.ts` | Reducer with all state transitions |
| `lib/blob/use-dataset.ts` | Public hook — smart dispatch, publish, deleteDraft |
| `lib/blob/use-auto-save.ts` | Debounced auto-save (80ms batch window) |
| `lib/blob/api-client.ts` | API wrapper (fetch → Rails via Next.js rewrites) |
| `lib/blob/dataset-mutations.ts` | Pure `applyAction()` — immutable data transforms |
| `lib/blob/change-log.ts` | `buildChangeEntry()`, `replayChanges()` for undo |
| `lib/blob/dataset-diff.ts` | `computeDatasetDiff()` + word-level LCS for review UI |

## State Shape (`DatasetState`)
```
live/draft/dataset  — Dataset objects (draft is active when editing)
original            — snapshot of live.data when editing started (for undo replay)
isEditing           — true when draft exists
isDirty             — true when dataset differs from original
changeLog           — ChangeEntry[] for undo/history
mutationVersion     — increments on every data change
savedVersion        — set to mutationVersion after successful auto-save
saveStatus          — "idle" | "saving" | "saved" | "error"
lastSavedAt         — timestamp (ms)
pendingMutations    — queued while draft is being created
draftCreating       — true during POST /draft
```

## Lifecycles

### Boot
`DatasetProvider` → `loadLiveDataset()` → dispatch LOAD_LIVE → `loadDraftDataset()` → if exists, dispatch LOAD_DRAFT

### First Edit (no draft yet)
1. `smartDispatch` intercepts mutation
2. Queues mutation in `pendingMutations`
3. Dispatches DRAFT_CREATING, calls `apiCreateDraft()`
4. On response: DRAFT_CREATED replays queued mutations, bumps `mutationVersion`
5. Auto-save picks up the version change

### Subsequent Edits
Mutation → reducer applies via `applyAction()` → `mutationVersion++` → auto-save fires after 80ms

### Auto-Save
- Watches `mutationVersion` changes via useEffect
- 80ms debounce batches rapid edits
- `savingRef` prevents concurrent saves
- After save: checks if more mutations arrived, re-saves if needed
- Uses `savedVersion` to track what's been persisted

### Publish
`publish()` → `flushSave()` (force pending save) → `apiPublishDraft()` → DRAFT_PUBLISHED (resets to live mode)

### Discard
`deleteDraft()` → `apiDeleteDraft()` → DRAFT_DELETED (reverts to live)

### Undo
- UNDO_CHANGE: filters entry from changeLog, replays remaining from `original`
- UNDO_ALL: resets to `structuredClone(original)`
- REVERT_FIELD: restores single field from `live.data`, adds revert entry to changeLog

## Race Conditions Handled
1. **Mutations during draft creation** → queued in `pendingMutations`, replayed on DRAFT_CREATED
2. **Mutations during auto-save** → `mutationVersion > savingVersion` check in finally block triggers re-save
3. **Server data staleness** → AUTO_SAVED keeps local data, only adopts server metadata (id, status)
4. **Publish with pending save** → `flushSave()` called first

## API Endpoints
| Method | Path | Action |
|--------|------|--------|
| GET | `/admin/facts_datasets/live` | Load published dataset |
| GET | `/admin/facts_datasets/draft` | Load draft (404 = none) |
| POST | `/admin/facts_datasets/draft` | Create draft from live |
| PATCH | `/admin/facts_datasets/draft` | Save draft `{data, test_cases}` |
| DELETE | `/admin/facts_datasets/draft` | Discard draft |
| POST | `/admin/facts_datasets/draft/publish` | Publish draft → live |

All go through Next.js rewrite: `/api/*` → Rails API. Auth via cookies. 401 → redirect to `/login`.

## Mutation Actions
```
Facts:    SET_FACT, ADD_FACT, DISCARD_FACT, RESTORE_FACT
Questions: SET_QUESTION, ADD_QUESTION, DISCARD_QUESTION, RESTORE_QUESTION
Rules:    SET_RULE, ADD_RULE, DISCARD_RULE (no restore)
Constants: SET_CONSTANT_VALUE, ADD_CONSTANT_VALUE, TOGGLE_CONSTANT_VALUE, DELETE_CONSTANT_VALUE
```
Facts/Questions/Rules: soft-delete via `enabled: false`. Constants: can hard-delete.
