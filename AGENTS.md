# Agents

These are instructions for working in this repository for coding agents.

## Overview

Standalone Next.js 16 admin app for Giki. Uses App Router, React 19, TypeScript, Tailwind CSS 4 with TailAdmin theme system.

This is a standalone project (not a monorepo). All commands run from the project root.

## Commands

- `pnpm run dev` - Start dev server on port 3020
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint
- `pnpm run format` - Format code with Prettier
- `pnpm run format:check` - Check formatting
- `pnpm run test` - Run Jest tests
- `npx tsc --noEmit` - Run TypeScript type checking

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `app/globals.css` - TailAdmin theme (colors, typography, shadows, utilities)
- `components/ui/` - Vendored TailAdmin UI components (Button, Modal, Table, etc.)
- `tests/` - Jest unit tests

## Code Standards

- TypeScript strict mode
- ESLint with strict rules (see eslint.config.mjs)
- Prettier for formatting (120 char width, double quotes, no trailing commas)
- Function declarations preferred over arrow functions at top level
- `import type` for type-only imports
- PascalCase for types, camelCase for variables/functions
- Max ~100 lines per file; extract components when growing
- Path alias: `@/*` maps to project root

## TailAdmin Theme

The design system is defined in `app/globals.css`:

- Color palette: brand, gray, success, error, warning, blue-light, orange
- Typography: title-2xl through theme-xs
- Shadows: theme-xs through theme-xl
- Custom utilities: menu-item, menu-dropdown, scrollbar variants
- Dark mode via class-based `.dark` variant
- Font: Outfit (Google Fonts)
