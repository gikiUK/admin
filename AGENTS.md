# Agents

These are instructions for working in this repository for coding agents.

## Overview

Standalone Next.js 16 admin app for Giki. Uses App Router, React 19, TypeScript, Tailwind CSS 4 with shadcn/ui components.

This is a standalone project (not a monorepo). All commands run from the project root.

## Commands

- `pnpm run dev` - Start dev server on port 3112
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run deploy` - Build with OpenNext and deploy to Cloudflare Workers
- `pnpm run check` - Run Biome (lint + format + organize imports)
- `pnpm run check:fix` - Auto-fix Biome issues
- `pnpm run lint` - Run Biome linter only
- `pnpm run format` - Format code with Biome
- `pnpm run format:check` - Check formatting
- `pnpm run test` - Run Jest tests
- `npx tsc --noEmit` - Run TypeScript type checking

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `app/globals.css` - Theme variables (TailAdmin palette + shadcn/ui tokens)
- `components/ui/` - shadcn/ui components (vendored, editable)
- `lib/blob/` - Dataset state management (reducer, auto-save, API client, mutations)
- `lib/utils.ts` - Shared utilities (`cn()` class merger)
- `tests/` - Jest unit tests

## Architecture Docs

Read these before making changes to understand how the system works:

- [State Management](docs/state-management.md) - reducer, auto-save, smart dispatch, race conditions, API endpoints, lifecycles
- [UI Architecture](docs/ui-architecture.md) - layout hierarchy, routes, component map, server/client boundaries
- [Data Model](docs/data-model.md) - Dataset/Facts/Questions/Rules/Constants/ActionConditions types, conditions, enriched types
- [Condition Patterns](docs/condition-patterns.md) - breakdown of all conditions across data files

### Key Architecture Decisions

- **Draft/Live versioning**: edits create a draft, publish promotes to live
- **Auto-save**: 80ms debounce, version tracking prevents race conditions
- **Smart dispatch**: auto-creates draft on first mutation, queues during creation
- **Undo via replay**: original + filtered changeLog → recompute state
- **Immutable mutations**: `applyAction()` returns new objects, never mutates

### Known Gotchas

- Questions and Rules use array indices as identifiers - index shifts break references
- Browser logs 404 for GET /draft when no draft exists - this is normal (caught by ApiError.isNotFound)
- DRAFT_CREATED must bump `mutationVersion` when replaying pending mutations, or auto-save won't trigger
- AUTO_SAVED keeps local data (not server response) to handle edits during save flight

## Adding shadcn/ui Components

```bash
npx shadcn@latest add <component-name>
```

Components are copied into `components/ui/` as source files you own and can edit.

## Code Standards

- TypeScript strict mode
- Biome for linting and formatting (120 char width, double quotes, no trailing commas)
- Function declarations preferred over arrow functions at top level
- `import type` for type-only imports
- PascalCase for types, camelCase for variables/functions
- Max ~100 lines per file; extract components when growing
- Path alias: `@/*` maps to project root

## Refactoring Guidelines

Apply these whenever splitting or reorganizing a folder of components:

- **One component per file.** A file exports a single React component. Sub-components used only by that component live in their own files too.
- **Hard cap ~100 LOC per file**, aim for less. If a component grows past it, extract sub-components, hooks, or helpers.
- **Logic out of components.** Pure helpers go in `*-helpers.ts` (or `lib/<area>/`), stateful logic into `use<Name>.ts` hooks, types into `*-types.ts` when shared.
- **DRY.** If two components share formatting, derived data, or rendering primitives, lift them into a shared helper, hook, or small presentational component.
- **Folders by feature, not by kind.** Group by what the components are *about* (e.g. `funnel/`, `correlations/`), not by what they *are* (`charts/`, `cards/`). Humans navigate by feature.
- **Co-locate.** A feature folder holds its components, hooks, helpers, and types together. Only promote to a higher-level `lib/` when more than one feature uses it.
- **Single purpose.** Each component does one thing — render a card, render a tile, render a tooltip. Compose, don't conflate.
- **Name files by what they render**, kebab-case: `funnel-section.tsx`, `funnel-step-row.tsx`, `use-funnel-data.ts`.
- **Index files are optional, not mandatory.** Only add a barrel `index.ts` when a folder exposes a small, stable public surface — don't add one just to shorten imports.

## React Compiler

**This project uses the React Compiler** (`reactCompiler: true` in `next.config.ts`, `babel-plugin-react-compiler` installed). It auto-memoizes derived values and stable references inside components. Consequences:

- **Do not write `useMemo`, `useCallback`, or `React.memo` by default.** The compiler caches the same expressions with the deps it infers from the code, so manual memoization is redundant noise and a stale-deps foot-gun. If you find one in existing code, removing it is usually correct.
- **Exceptions** — keep manual memoization only when:
  - The value flows into a `useEffect` / `useLayoutEffect` deps array (referential stability is the contract).
  - The value is passed to a `React.memo`-wrapped child or used as a context value.
  - It's consumed by an external library that compares by reference.
  - The component contains a compiler bail-out pattern (prop/state mutation, conditional hooks, refs read during render) — rare; if you see one, fix the bail-out instead of papering over with `useMemo`.
- **Do not opt out with `"use no memo"`** unless you have a concrete, documented reason.
- **No `eslint-plugin-react-compiler` is installed** (repo uses Biome only). That means compiler bail-outs are silent. When in doubt about a removal, trace the consumer chain — does the result flow into effect deps, a memo'd child, or a context value? If no, the compiler handles it.
- **Hook naming honesty.** If you remove the only React-hook call from a `use*` function, rename it (`useFooBar` → `buildFooBar` / `splitFooBar`) and drop the `use-` filename prefix. The `use-` convention is a contract that the function calls hooks.

## Design System

shadcn/ui semantic color tokens defined in `app/globals.css`:

- **Primary color**: Purple (`oklch(0.541 0.281 293.009)`)
- Semantic tokens: primary, secondary, accent, destructive, muted, card, popover, sidebar
- Dark mode via class-based `.dark` variant
- Font: Outfit (Google Fonts)
- Icons: Lucide React

## Current Plan

See [docs/plan-facts-questions-ui.md](docs/plan-facts-questions-ui.md) for the Phase 1 implementation plan (Facts & Questions UI with sidebar layout).
