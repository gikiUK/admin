# Giki Admin

Administration dashboard for Giki.

## Tech Stack

- Next.js 16 (App Router)
- React 19 with React Compiler
- TypeScript 5
- Tailwind CSS 4 with TailAdmin theme

## Getting Started

```bash
pnpm install
pnpm run dev
```

The dev server runs at [http://localhost:3112](http://localhost:3112).

## Commands

| Command                 | Description                  |
| ----------------------- | ---------------------------- |
| `pnpm run dev`          | Start dev server (port 3112) |
| `pnpm run build`        | Production build             |
| `pnpm run lint`         | Run ESLint                   |
| `pnpm run format`       | Format with Prettier         |
| `pnpm run format:check` | Check formatting             |
| `pnpm run test`         | Run Jest tests               |
| `npx tsc --noEmit`      | TypeScript type checking     |

## Facts Engine Package

The `@giki/facts-engine` package provides the facts engine logic (condition evaluation, rule derivation, question visibility) and all blob types. It is published to GitHub Packages from the API repo (`../api/packages/facts-engine/`).

- **Locally:** `.pnpmfile.cjs` automatically links to `../api/packages/facts-engine` when the directory exists. The `bin/dev` script builds the package before starting Next.js.
- **Deploy:** Installed from GitHub Packages using `NODE_AUTH_TOKEN` (configured as a Cloudflare secret).
- **Types:** Import blob types from `@giki/facts-engine` (e.g. `DatasetData`, `BlobQuestion`, `BlobCondition`).

## Deployment

### Sentry

Sentry is used for error monitoring and performance tracing. Before deploying to production, the following must be configured:

- **Sentry DSN**: Replace the `"TODO"` placeholder DSN in `sentry.edge.config.ts` and `instrumentation-client.ts` with the actual Sentry DSN for the `giki-admin` project (org: `thalamus-ai`).
- **`SENTRY_AUTH_TOKEN`**: Set the `SENTRY_AUTH_TOKEN` environment variable in your CI/CD environment. This is required for source map uploads during production builds. For local builds, you can set it in `.env.sentry-build-plugin`.
