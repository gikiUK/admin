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

The dev server runs at [http://localhost:3020](http://localhost:3020).

## Commands

| Command                 | Description                  |
| ----------------------- | ---------------------------- |
| `pnpm run dev`          | Start dev server (port 3020) |
| `pnpm run build`        | Production build             |
| `pnpm run lint`         | Run ESLint                   |
| `pnpm run format`       | Format with Prettier         |
| `pnpm run format:check` | Check formatting             |
| `pnpm run test`         | Run Jest tests               |
| `npx tsc --noEmit`      | TypeScript type checking     |

## Deployment

### Sentry

Sentry is used for error monitoring and performance tracing. Before deploying to production, the following must be configured:

- **Sentry DSN**: Replace the `"TODO"` placeholder DSN in `sentry.edge.config.ts` and `instrumentation-client.ts` with the actual Sentry DSN for the `giki-admin` project (org: `thalamus-ai`).
- **`SENTRY_AUTH_TOKEN`**: Set the `SENTRY_AUTH_TOKEN` environment variable in your CI/CD environment. This is required for source map uploads during production builds. For local builds, you can set it in `.env.sentry-build-plugin`.
