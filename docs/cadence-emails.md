# Cadence Emails — admin UI brief

Build a screen for editing the onboarding email cadences.

The API side is on the `onboarding-email-cadences` branch of `giki/api` ([PR #357](https://github.com/gikiUK/api/pull/357)). The contract below is settled, so this can be built before it merges.

## Context

New signups are put through a sequence of onboarding emails ("cadences"). There are three, and a company is in at most one at a time:

| `cadence_key` | Who's in it | Emails |
|---|---|---|
| `nudge_to_create_profile` | Hasn't completed their sustainability profile | 2 |
| `nudge_to_create_plan` | Profile done, hasn't selected actions | 2 |
| `plan_guidance` | Both parts of onboarding done | 5 |

Cadences are named for what the emails are *for*, not the state of the company receiving them. Companies move forward through them as they progress, never backwards. The company drives the schedule — one email every 2 days — and each is sent to every member of the company senior enough to receive that cadence (see `minimum_role` below; currently everyone except readonly members).

The **content** of each email lives in the database and is what this UI edits. The **logic** — who's in which cadence, who receives it, when emails send, which are suppressed for premium companies — lives in Rails and is deliberately not editable. Don't build UI for it.

## What to build

A `/cadence-emails` section under `app/(dashboard)/`.

**Follow this repo's existing conventions**, which the `signup-links` section demonstrates end to end:

- Route at `app/(dashboard)/cadence-emails/page.tsx`, plus `[key]/page.tsx` for edit
- Components under `components/cadence-emails/`, with the form split into `form/` like `components/signup-links/form/`
- Data through `@tanstack/react-query`, with query definitions and keys in `lib/cadence-emails/queries.ts` and types in `lib/cadence-emails/types.ts`
- `PageHeader` from `@/components/page-header`, shadcn/ui primitives from `@/components/ui/`
- Add the nav entry to `components/sidebar/menu-config.ts`

**Borrow the interaction pattern from the Jiki admin.** Jiki is a separate product built by the same team, and its Mailshots screens already solve the list / edit / server-rendered-preview / send-test flow this needs. There is no equivalent in the Giki admin, so you're porting the shape rather than extending something local — take the ideas, not the markup, and render them with Giki's components.

Worth reading at `../../jiki/admin/`:

| File | Why |
|---|---|
| `app/dashboard/mailshots/page.tsx` | Index layout |
| `app/dashboard/mailshots/components/MailshotTable.tsx` | List rendering |
| `app/dashboard/mailshots/components/MailshotForm.tsx` | Edit form, including the markdown body field |
| `app/dashboard/mailshots/components/ServerPreview.tsx` | The preview-in-an-iframe pattern — the key one |
| `app/dashboard/mailshots/components/SendConfirmModal.tsx` | Send-test confirm flow |
| `lib/api/mailshots.ts` | API client shape |

Ignore the parts of Mailshots that don't apply: segments, create/delete, pagination, filters, and the sent/unsent status machinery.

### 1. Index

`GET /admin/cadences` returns the whole structure in one call — cadences in the order companies progress through them, each with its emails already in send order. Render it as-is; no client-side grouping or sorting needed. Show `position`, `subject`, whether it's `enabled`, and the `key`. Make it obvious that order within a cadence is send order.

Three fixed groups, with human labels:

- `nudge_to_create_profile` → "Nudge to create profile"
- `nudge_to_create_plan` → "Nudge to create plan"
- `plan_guidance` → "Plan guidance"

No create or delete — the set of emails is seeded by the API. Rows are edit-only. Only nine rows exist, so no pagination, search or filtering.

### 2. Edit

| Field | Type | Notes |
|---|---|---|
| `subject` | string, required | Email subject line |
| `preview_text` | string | Inbox preview snippet |
| `body_markdown` | markdown textarea | The body. Markdown only — no HTML, no MJML |
| `cta_text` | string | Button label. The button is omitted if this or `cta_path` is blank |
| `cta_path` | string | **Path only**, e.g. `/actions/recommendations`. The API prepends the frontend base URL |
| `enabled` | boolean | Disabled emails are skipped in the sequence |

`key`, `cadence_key`, `position` and `rules` are read-only — display them, don't let them be edited. `key` is what guarantees an email is never sent to the same person twice, so it must never change.

Validate client-side that `cta_path` starts with `/`. It's a path, not a URL.

### 3. Live preview

POST the *unsaved* form values to the preview endpoint and render the returned HTML in an iframe. Rails renders it through the real mailer, so the preview is exactly what sends — including header, footer, greeting ("Hi there,"), signoff ("The Giki Team") and the unsubscribe links, none of which are editable here.

### 4. Send test

A "Send test to me" button posting to the send-test endpoint. Sends the email, as rendered, to the logged-in admin. It records nothing, so it neither counts as a send nor stops the real email arriving later.

## API contract

All endpoints are admin-authenticated. `:key` in the URL is the email's `key` string (e.g. `plan_guidance_premium`), not a numeric id.

```
GET    /admin/cadences
GET    /admin/cadence_emails/:key
PATCH  /admin/cadence_emails/:key
POST   /admin/cadence_emails/:key/preview
POST   /admin/cadence_emails/:key/send_test
```

**`GET /admin/cadences`** returns everything the index needs in one call. Not paginated. Cadences come back in progression order; emails in send order within each, disabled ones included so they can be turned back on.

```json
{
  "cadences": [
    {
      "key": "plan_guidance",
      "entry_condition": "have completed onboarding and have a plan",
      "gap_in_days": 2,
      "rules": [{ "key": "minimum_role", "value": "standard" }],
      "emails": [ { "...": "..." } ]
    }
  ]
}
```

`entry_condition` completes the sentence "Companies that ___" — lowercase, no full stop, guaranteed by a test.

**Cadence email object**, verbatim from `SerializeCadenceEmail`:

```json
{
  "key": "plan_guidance_premium",
  "cadence_key": "plan_guidance",
  "position": 5,
  "subject": "Give your Climate Action Plan a boost",
  "preview_text": "Templates, implementation plans and business cases",
  "body_markdown": "Do you need an implementation plan for each of your actions...",
  "cta_text": "Explore Premium",
  "cta_path": "/settings/subscription",
  "enabled": true,
  "rules": [{ "key": "minimum_role", "value": "owner" }, { "key": "non_premium_only" }]
}
```

**Rules** describe who receives something and when it's skipped. They appear on both cadences and emails in the same shape. Every rule has a `key`; `minimum_role` also carries `value`. Treat them as a discriminated union on `key` — render anything unrecognised from its key alone. New rule types will appear without the shape changing.

An email's `rules` is the *effective* set, including what it inherits from its cadence. Never merge the two; the email already tells you the answer. An email may be more restrictive than its cadence (owners-only within a standard cadence) but never less.

`rules` is `[]` when nothing applies, and is read-only — `PATCH` ignores it, as it does `key`, `cadence_key` and `position`.

**`GET`/`PATCH /admin/cadence_emails/:key`**:

```json
{ "cadence_email": { "...": "..." } }
```

`PATCH` body — all fields optional, send only what changed:

```json
{ "cadence_email": { "subject": "...", "preview_text": "...", "body_markdown": "...", "cta_text": "...", "cta_path": "...", "enabled": true } }
```

Validation failures return `422` with the standard error envelope:

```json
{ "error": { "type": "validation_error", "message": "...", "errors": { "subject": ["can't be blank"] } } }
```

**`POST /admin/cadence_emails/:key/preview`** — body is the same shape as `PATCH`, carrying the unsaved values. Nothing is persisted:

```json
{ "html": "<!doctype html>..." }
```

**`POST /admin/cadence_emails/:key/send_test`** — no body:

```json
{}
```

An unknown `key` returns `404` with `type: "cadence_email_not_found"`.

## Out of scope

- Creating, deleting or reordering emails.
- Editing which companies are in which cadence, the 2-day gap, or the premium suppression rule.
- Any view of which companies have received what. That may come later; it isn't in this piece of work.
- i18n. English only for now.

## Notes

- The greeting and signoff are fixed in the Rails template. If someone types "Hi there," into `body_markdown` it'll appear twice — worth a hint under the field.
- Markdown is rendered by Kramdown, which applies smart quotes. Straight quotes in the editor will come out curly in the email; that's intended.
