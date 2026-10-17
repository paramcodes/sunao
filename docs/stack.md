# Stack

Each entry: What / Why / Why not X.

## Framework
- **Next.js 15 (App Router)**: React framework with routing, layouts, server components, API routes. Why: ships routing + data fetching + API layer for free; Spotify web is React-based so patterns transfer. Why not Vite+React: would hand-roll routing/data/API; fine for demos, costly for a product.

## Language
- **TypeScript (strict)**: typed JS. Why: catches errors at compile time, better agent/IDE support, self-documenting. Why not JS: no safety net for a growing codebase.

## Styling
- **Tailwind CSS v4**: utility-first CSS. Why: fast iteration, design tokens via CSS vars, matches our prototype. Why not CSS Modules: slower iteration, no token ergonomics.
- **shadcn/ui**: copy-paste accessible components on Radix primitives. Why: we own the code, themeable to our red tokens, accessible by default. Why not MUI/Chakra: heavier, opinionated, fight the design system.

## State
- **Zustand**: tiny client state store. Why: no boilerplate, perfect for a media player (play/pause/queue/speed). Why not Redux Toolkit: overkill for this scope.
- **TanStack Query**: server state (playlists, songs, user). Why: caching, prefetch, mutations, devtools. Why not SWR: better mutation handling and devtools.

## Validation
- **Zod**: runtime schema validation at boundaries. Why: parse external data (Supabase responses) into typed values; fail fast on bad data. Why not manual checks: repetitive and error-prone.

## Backend / auth / storage
- **Supabase**: Postgres + Auth + Storage + RLS. Why: one platform for DB, auth, audio file storage; RLS secures per-user playlists without a custom auth layer. Why not Firebase: document model awkward for relational playlist/song data; not self-hostable. Why not custom Node+Postgres: months of plumbing for an MVP.

## Audio
- **Native HTMLAudioElement in a `usePlayer` hook**. Why: browser handles decoding/streaming, zero deps. Why not Howler.js: adds normalization we don't need for modern browsers, inflates bundle; revisit if Safari quirks appear.

## Testing
- **Vitest + React Testing Library**: unit/component tests. Why: Vite-fast, Jest-compatible API, works with Next. Why not Jest: slower, more config.
- **Playwright**: E2E across browsers. Why: reliable audio/UI flows, trace viewer, parallel. Why not Cypress: slower, weaker multi-tab/audio handling.
- **MSW**: mock API in tests. Why: realistic network mocking without a backend.

## Lint / format
- **Biome**: single tool for lint + format. Why: ~100x faster than ESLint+Prettier, one config. Why not ESLint+Prettier: two tools, slower, config sprawl. (ESLint added only if a plugin gap blocks us.)
- **Comment policy**: enforced by `scripts/check-comments.mjs` (allowlist) + the `no-comments` skill review pass. Why: comments rot in agentic workflows; code should be self-documenting. Why not a blanket ban: license/SPDX headers, eslint-disable, @ts-expect-error, and public JSDoc are still needed.

## Tooling
- **pnpm**: package manager. Why: strict node_modules (no phantom deps), fast, disk-efficient. Why not npm/yarn/bun: pnpm strictness prevents subtle bugs; bun ecosystem still has rough edges.
- **Husky + lint-staged**: pre-commit hooks. Why: run Biome on staged files before commit. Why not lefthook: similar; husky is more common and well-documented.
- **GitHub Actions**: CI (typecheck, lint, comments, test, build).
- **Vercel**: deploy (Next.js native, preview URLs per PR).

## Icons / fonts
- **Lucide React**: icon set. Why: shadcn default, currentColor-based, outline default / fill active. Why not Heroicons/FontAwesome: Lucide is the shadcn convention; one set keeps stroke weight consistent.
- **next/font (Inter)**: self-hosted font. Why: no layout shift, no external request.
