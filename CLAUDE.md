# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```sh
bun install          # Install dependencies (or pnpm install)
bun run dev          # Start dev server at http://localhost:3000
bun run build        # Build for production + type check
bun run start        # Run production server (.output/server/index.mjs)
```

## Tech Stack

- **Framework**: TanStack Start with TanStack Router (full-stack React)
- **React**: v19 with strict TypeScript
- **Styling**: Tailwind CSS v4
- **Server**: Nitro
- **Validation**: Zod for runtime schema validation
- **Build**: Vite

## Architecture

### File-Based Routing

Routes are defined in `src/routes/` using TanStack Router's file-based conventions:

- `__root.tsx` - Root layout with navigation and global error handling
- `index.tsx` - Home page (`/`)
- `posts.tsx` / `posts.index.tsx` / `posts.$postId.tsx` - Nested routes with dynamic params
- `_pathlessLayout.tsx` - Layout routes that don't add URL segments
- `api/users.ts` - API endpoints with server handlers

### Route Structure Patterns

- Dynamic params: `$paramName` (e.g., `posts.$postId.tsx` → `/posts/:postId`)
- Layout routes: `_layoutName.tsx` (wraps child routes without URL segment)
- Index routes: `routeName.index.tsx` (default child)
- Deep routes: `routeName_.$param.deep.tsx` (breaks out of parent layout)

### Key Files

- `src/router.tsx` - Router configuration with preload and scroll restoration
- `src/routeTree.gen.ts` - **Auto-generated, do not edit** (marked read-only in VSCode)
- `src/utils/seo.ts` - SEO metadata helper
- `src/components/` - Error boundaries and UI components

### API Routes

API routes in `src/routes/api/` use TanStack Start's server handlers with middleware support:

```ts
export const Route = createFileRoute('/api/users')({
  server: {
    middleware: [loggingMiddleware],
    handlers: {
      GET: async ({ request }) => Response.json(data),
    },
  },
})
```

## Path Aliases

Use `~/` to import from `src/`:

```ts
import { seo } from '~/utils/seo'
```
