# Stack

Each entry: What / Why / Why not X.

## Framework
- **Next.js 16 (App Router, Turbopack)**: React framework with routing, layouts, server components, and route handlers. Why: ships routing and data fetching for free; Spotify's web player is React-based, so patterns transfer. Why not Vite + React: we would hand-roll routing and data fetching; fine for demos, costly for a product.

## Language
- **TypeScript (strict)**: typed JS. Why: catches errors at compile time, better agent/IDE support, self-documenting. Why not JS: no safety net for a growing codebase.

## Styling
- **Tailwind CSS v4**: utility-first CSS. Why: fast iteration, design tokens via CSS variables, matches the prototype. Why not CSS Modules: slower iteration, no token ergonomics.
- **shadcn/ui on Base UI**: copy-paste components we own, built on `@base-ui/react` primitives. Why: we control the code and can theme it to our red tokens, and the primitives handle focus, dismissal, and ARIA. Why not MUI/Chakra: heavier and opinionated; we would fight the design system.

## State
- **Zustand**: tiny client store for the player (play/pause, queue, position, speed, likes). Why: no boilerplate, and it is the right size for media state. Why not Redux Toolkit: overkill for this scope.
- **TanStack Query**: server state (songs, albums, playlists). Why: caching, prefetching, mutations, devtools. Why not SWR: better mutation handling and devtools.
- **TanStack Virtual**: windowing the queue list. Why: only the visible rows mount, so a long queue stays cheap and scroll position survives a panel resize.
- **Zod**: runtime schema validation at boundaries. Why: parse external data (Supabase rows, the static dataset) into typed values and fail fast on bad data. Why not manual checks: repetitive and error-prone.

## Backend / auth
- **Supabase**: Postgres + Auth + RLS. Why: one platform for the database and auth, and RLS scopes playlists per user without a custom auth layer. Why not Firebase: the document model is awkward for relational playlist/song data, and it is not self-hostable. Why not a custom Node + Postgres service: months of plumbing for an MVP.
- Audio and artwork are not stored here. Previews come from the iTunes Search API and covers from the iTunes CDN, so there is no bucket to manage.

## Audio
- **Native `HTMLAudioElement` in a `useAudio` hook**: Why: the browser handles decoding and streaming, with zero dependencies. The hook fetches a 30-second iTunes preview per title + artist (cached in memory), falls back to a bundled sample tone, and syncs play/pause, seek, and rate with the store. Why not Howler.js: it adds normalization we do not need for modern browsers and inflates the bundle; revisit if Safari quirks appear.

## Testing
- **Vitest + React Testing Library**: unit and component tests. Why: Vite-fast, Jest-compatible API, works with Next. Why not Jest: slower, more config.
- **Playwright**: E2E across browsers. Why: reliable audio and UI flows, trace viewer, parallel runs. Why not Cypress: slower, weaker audio handling.

## Lint / format
- **Biome**: one tool for lint and format. Why: much faster than ESLint + Prettier, one config. Why not ESLint + Prettier: two tools, slower, config sprawl. (ESLint is added only if a plugin gap blocks us.)
- **Comment policy**: enforced by `scripts/check-comments.mjs` (allowlist) plus a `no-comments` review pass. Why: comments rot in agentic workflows; code should be self-documenting. Why not a blanket ban: license/SPDX headers, biome-ignore, @ts-expect-error, and public JSDoc are still needed.

## Tooling
- **pnpm**: package manager. Why: strict `node_modules` (no phantom deps), fast, disk-efficient. Why not npm/yarn/bun: pnpm's strictness prevents subtle bugs, and bun's ecosystem still has rough edges.
- **Husky + lint-staged**: pre-commit hooks. Why: run Biome on staged files before commit. Why not lefthook: similar; husky is more common and well documented.
- **GitHub Actions**: CI (typecheck, lint, comments, test, build).
- **Vercel**: deploy (Next.js native, preview URLs per PR).
- **ffmpeg**: encoding the README demo video and GIF (see `scripts/capture-readme.mjs`). Not a runtime dependency.

## Icons / fonts
- **Lucide React**: icon set. Why: the shadcn default, `currentColor`-based, outline by default and filled when active. Why not Heroicons/FontAwesome: one set keeps the stroke weight consistent.
- **next/font (Figtree)**: self-hosted font. Why: no layout shift, no external request; the closest free match to Spotify's Circular Std. Mono is Geist Mono.
