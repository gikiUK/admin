# Task for Frontend Claude — exhaustive signup-link e2e coverage

You are working in `../front-end/app` (the `@giki/app` package). Read
`CLAUDE.md` first if you haven't.

## Context

`/auth/signup/[code]` is the signup-link entry. The admin side
(`../admin`) recently shipped exhaustive Playwright coverage that proves
every payload variant we can create lands correctly. We need the same
on this side: every variant of `SignupLink` the admin can produce must
have a corresponding frontend e2e that pins what the user sees.

**Important context:**

- The signup-link UI is **not finalised**. Copy, layout, and even the
  component split may change. Write tests that survive UI churn —
  assert on stable signals (role/heading semantics, presence of the
  signup form, the request payload going back to the API) rather than
  brittle text snapshots. Where you must pin text, prefer regex over
  exact strings, and pull copy from a const at the top of the spec
  file so a future rename is one line.
- You are NOT redesigning the UI. You are NOT adding new components.
  You are NOT refactoring. Don't fix code you didn't write tests for.
- `tests/e2e/auth/signup-link-flow.spec.ts` already exists with 8
  scenarios. Read it. Extend it; don't replace it. Match its style.
- `tests/e2e/helpers/api-mocks.ts` already exposes `mockAPISignupLink(page, code, state)`.
  Extend the state union if you need new variants; don't fork the helper.

## Scope — what's missing today

The existing spec covers: not-found, usable-with-welcome,
usable-no-welcome, expired, exhausted, disabled, the
`/auth/workshop/:code` redirect, the `signup_code` round-trip on
success, and the unconfirmed-email branch. Good baseline.

What's missing — please add tests for each, one test per bullet
unless noted:

### A. Welcome page content fidelity

The welcome page renders markdown (`SignupLinkWelcome`). Today the
spec only checks the title heading. Add tests that:

1. **Markdown body renders as HTML, not raw text.** Mock a welcome
   page with body `"## Heading\n\nParagraph with **bold**."` and
   assert: an `h2` with text "Heading" is visible AND a `strong`
   element with text "bold" is visible. Do NOT assert on raw
   markdown characters appearing in the DOM.
2. **Link in markdown body is rendered as an anchor with the right
   href.** Body `"[Learn more](https://example.com/learn)"`. Assert a
   link with that href is present.

### B. Adversarial server-state combinations

The admin can mint links where `usable` and the individual flags
appear to disagree (e.g. all flags false but `usable=true`, or
`expired=true` AND `disabled=true`). The frontend's contract is
"`usable` is the single source of truth — if false, fall through to
plain signup with no code." Pin that:

3. **`usable=true` with every flag false** → welcome (if present) or
   signup form with `signupCode = link.code`. Standard happy path —
   redundant with the existing usable spec but worth pinning the
   "all flags zero" boundary explicitly.
4. **`usable=false` with two flags true simultaneously** (e.g.
   `expired=true, disabled=true`) → plain signup form, no code
   attached on submit. Mirror the existing expired-test's pattern
   that captures the signup POST body.
5. **`usable=false` but `welcome_page` is non-null** → welcome page
   is NOT shown; user sees the plain signup form directly. This pins
   the precedence: `usable` short-circuits welcome.

### C. Network-error vs not-found

`getSignupLink` currently treats every non-2xx (including 500) as
`null` and the page renders "Check your link". That's an intentional
choice but it's load-bearing — verify it:

6. **500 from `/external/signup_links/:code`** → "Check your link" UI
   appears (same as 404).
7. **Network failure / route abort** → same outcome. Use Playwright's
   `route.abort()` to simulate.

### D. signup_code propagation edge cases

8. **`signup_code` is sent verbatim (case + special chars
   preserved)**. Mock a usable link with code `"Partner-X.42"` and
   assert the POST body to `/auth/signup` carries
   `user.signup_code: "Partner-X.42"` — not a normalized variant.
9. **Server rejects signup with 422 even though the code was valid**
   → the form error surfaces to the user; the user stays on the
   signup form (does NOT route to `/companies/new`); the signup_code
   value is still in the captured request body.

### E. Contract sentinel (one new test file)

Add `tests/e2e/auth/signup-link-contract.spec.ts` (or a Jest test
under `tests/unit/` if that's more idiomatic in this repo — check
how the codebase pins API shapes today and follow that). The test
loads a JSON fixture that mirrors the Rails
`SerializeExternalSignupLink` output:

```ts
// fixture content — keep this exact shape; it mirrors
// api/test/serializers/serialize_external_signup_link_test.rb
{
  "code": "PARTNERX",
  "usable": true,
  "expired": false,
  "exhausted": false,
  "disabled": false,
  "welcome_page": { "title": "Welcome!", "body": "## Body" }
}
```

The test:
- imports the `SignupLink` type from `@/lib/signupLink/api`,
- type-asserts the fixture is assignable to `SignupLink` (a `const
  link: SignupLink = fixture` line is sufficient — TS will fail at
  build time if a field disappears or retypes),
- asserts there are no surplus keys (drift sentinel: a future Rails
  PR that adds a field won't silently start being ignored).

Put the fixture at `tests/fixtures/external-signup-link.json` (or
wherever fixtures live in this repo — check first). Add a short
README next to the fixture explaining where it came from and how to
refresh it. The refresh source is
`api/test/serializers/serialize_external_signup_link_test.rb` in
`../../api` — copy the expected hash from there.

## Hard constraints

- **Do not change the SignupLink type, the API client, or any
  component.** Tests only. If you find a real bug, document it at the
  bottom of the spec file as a `// TODO: …` comment and tell the
  user; don't fix it.
- **Do not introduce new dependencies.** Use what's already installed.
- **Match the existing spec style.** Same helpers, same assertion
  style, same naming. Look at `signup-link-flow.spec.ts` and the
  other spec files in `tests/e2e/auth/` first.
- **Run `pnpm run test:e2e tests/e2e/auth/signup-link-flow.spec.ts`
  AND your new contract test after each change.** Don't ship a spec
  you haven't seen pass. Don't claim something works because the type
  checks — actually run it.
- **No `console.log`, no `test.only`, no `test.skip` left in the diff.**
- **Resilient to UI churn.** If you find yourself writing
  `getByText("Welcome to Acme — Sign up now!")`, stop. Use the
  heading role, or assert by markdown structure (`h2` exists), or
  pull the literal into a `const COPY = { ... }` at the top of the
  file with a comment noting it's pinned to current copy and easy to
  update.

## Deliverable

A PR (or commit on the current branch — the user will tell you)
with:

- Extensions to `tests/e2e/auth/signup-link-flow.spec.ts` covering
  scenarios A1–D9.
- New contract test + fixture (E).
- A line or two in your commit message linking back to this brief.
- All tests passing locally; lint/typecheck clean.

If anything in this brief contradicts the codebase as you find it,
trust the codebase and surface the contradiction to the user — don't
quietly diverge.
