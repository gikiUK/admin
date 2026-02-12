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
- `lib/utils.ts` - Shared utilities (`cn()` class merger)
- `tests/` - Jest unit tests

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
