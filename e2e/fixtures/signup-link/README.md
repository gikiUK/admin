# Signup-link fixtures

`canonical.json` mirrors the expected output of Rails' `SerializeSignupLink` —
specifically the `"serializes a signup link"` test in
`api/test/serializers/serialize_signup_link_test.rb`. The mock-API layer hands
this shape to the admin UI in e2e tests, so it must stay in sync with what
production Rails returns.

## When to refresh

- A field is added, removed, or renamed in `SerializeSignupLink`.
- A field's encoding changes (e.g. date format).
- A serializer-test scenario is added that the admin UI needs to render.

## How to refresh

In `../api`:

```bash
bin/rails test test/serializers/serialize_signup_link_test.rb
```

If the test passes, copy the `expected = {...}` hash from the test source into
`canonical.json` as JSON. The shape in the test source is the single source of
truth — if it ever drifts from what the serializer actually emits, the Rails
test will catch it first.

For variant fixtures (expired, exhausted, etc.) we currently
build them in TypeScript via `e2e/mock-api/builders.ts`, layering overrides on
top of `canonical.json`. If a variant's shape gets non-trivial, capture it as
its own JSON file the same way.
