# Agents

These are instructions for working in this repository for coding agents.

## Overview

Standalone Next.js 16 admin app for Giki. Uses App Router, React 19, TypeScript, Tailwind CSS 4 with shadcn/ui components.

This is a standalone project (not a monorepo). All commands run from the project root.

## Commands

- `pnpm run dev` - Start dev server on port 3020
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
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

- [State Management](docs/state-management.md) — reducer, auto-save, smart dispatch, race conditions, API endpoints, lifecycles
- [UI Architecture](docs/ui-architecture.md) — layout hierarchy, routes, component map, server/client boundaries
- [Data Model](docs/data-model.md) — Dataset/Facts/Questions/Rules/Constants/ActionConditions types, conditions, enriched types
- [Condition Patterns](docs/condition-patterns.md) — breakdown of all conditions across data files

### Key Architecture Decisions

- **Draft/Live versioning**: edits create a draft, publish promotes to live
- **Auto-save**: 80ms debounce, version tracking prevents race conditions
- **Smart dispatch**: auto-creates draft on first mutation, queues during creation
- **Undo via replay**: original + filtered changeLog → recompute state
- **Immutable mutations**: `applyAction()` returns new objects, never mutates

### Known Gotchas

- Questions and Rules use array indices as identifiers — index shifts break references
- Browser logs 404 for GET /draft when no draft exists — this is normal (caught by ApiError.isNotFound)
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

## Design System

shadcn/ui semantic color tokens defined in `app/globals.css`:

- **Primary color**: Purple (`oklch(0.541 0.281 293.009)`)
- Semantic tokens: primary, secondary, accent, destructive, muted, card, popover, sidebar
- Dark mode via class-based `.dark` variant
- Font: Outfit (Google Fonts)
- Icons: Lucide React

## Current Plan

See [docs/plan-facts-questions-ui.md](docs/plan-facts-questions-ui.md) for the Phase 1 implementation plan (Facts & Questions UI with sidebar layout).
