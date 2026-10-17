# sunao

A Spotify-like music player. Red theme, dark UI. Built with Next.js 16, React 19, Tailwind v4, shadcn/ui on Base UI, Supabase, Zustand, and TanStack Query.

**Live demo:** https://sunao-omega.vercel.app

![sunao demo: play an album, search, open a playlist, collapse the queue, like a track](artifacts/readme/demo.gif)

Full-resolution video: [MP4](artifacts/readme/demo.mp4) · [WebM](artifacts/readme/demo.webm).

## Screenshots

| Home | Search |
|---|---|
| ![Home](artifacts/readme/home.png) | ![Search](artifacts/readme/search.png) |

| Library | Playlist |
|---|---|
| ![Library](artifacts/readme/library.png) | ![Playlist](artifacts/readme/playlist.png) |

| Now playing | Collapsed queue |
|---|---|
| ![Now playing](artifacts/readme/playing.png) | ![Collapsed queue](artifacts/readme/queue-collapsed.png) |

| Sign in | Sign up |
|---|---|
| ![Sign in](artifacts/readme/login.png) | ![Sign up](artifacts/readme/signup.png) |

| Mobile home | Mobile queue |
|---|---|
| ![Mobile home](artifacts/readme/mobile-home.png) | ![Mobile queue](artifacts/readme/mobile-queue.png) |

Captured from a production build; regenerate with [scripts/capture-readme.mjs](scripts/capture-readme.mjs).

## Features

Playback
- Play / pause, previous / next, and auto-advance when a track ends
- Seek scrubber bound to the audio element's real duration, with position and total labels
- Playback speed: 0.5×, 1×, 1.25×, 1.5×, 2×
- Like / unlike the current track (session-only, in memory; not persisted to Supabase)
- Buffering spinner, debounced 200ms so it does not flash on fast loads
- Audio: 30-second previews from the iTunes Search API (no key), cached per title + artist, falling back to a bundled sample tone
- Album artwork from the iTunes CDN, served through `next/image`

Browse
- Home: album grid (click an album to play it) plus the full song list
- Search: filter songs by title or artist, with an empty state
- Library: list playlists and create a new one (writes to Supabase, or to a local store without a backend)
- Playlist detail: cover, song count, "Play all", remove a song, empty state

Now playing and queue
- Now-playing card and a windowed (virtualized) queue; click any row to jump to it
- Collapsible queue panel at `lg` and up: narrows to a 40px rail instead of unmounting, so the toggle stays reachable and scroll position survives; the collapsed content is `inert`
- Mobile queue in a bottom sheet

Auth (Supabase, optional)
- Email and password sign in / sign up, plus an `/auth/callback` route for confirmation links
- `src/proxy.ts` refreshes the session and protects `/library` and `/playlist/*`
- With the Supabase env vars unset the app runs without a backend: static seed data, in-memory playlists, and no auth

Mobile
- Bottom nav (Home / Search / Library / Queue) below `lg`, replacing the hidden sidebar
- Compact player bar with a 2px progress line; the seek bar and speed control appear from `md` up
- Safe-area padding on the bottom nav

Discoverability
- Per-route metadata from the server components: title, description, canonical URL, Open Graph, and Twitter cards
- `robots.txt`, a `sitemap.xml` generated from the catalogue, and generated OG/Twitter share images
- `MusicRecording` structured data on playlist pages; library, login, and signup are `noindex`

Polish
- Loading skeletons for the home route; empty states for search and playlists
- Accessibility: ARIA labels and states on player controls, tooltips with keyboard hints, Space toggles play/pause, focus-visible ring, `inert` collapsed panels
- Motion: shared easing tokens, pointer-gated hover, press feedback, staggered album entrance, heart pop, artwork pulse, and reduced-motion support
- Performance: `optimizePackageImports` for lucide-react and react-query

## Tech stack

See [docs/stack.md](docs/stack.md) for the full list with rationale. Highlights:

- Next.js 16 (App Router, Turbopack) and React 19
- TypeScript (strict)
- Tailwind CSS v4 and shadcn/ui primitives on Base UI
- Zustand (player state) and TanStack Query + Virtual (server state and the queue)
- Vercel Analytics and Speed Insights for page views and Web Vitals
- Supabase (Postgres, Auth, RLS) and Zod (boundary validation)
- Vitest and React Testing Library, Playwright (E2E)
- Biome (lint and format), Husky and lint-staged

## Getting started

Prerequisites: Node 20+, pnpm 12+.

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

Optional: create `.env.local` with the variables below for Supabase data and auth.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=          # canonical origin for metadata, sitemap, and share images
```

Without them the app falls back to the bundled seed data and skips auth.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm typecheck` | TypeScript strict check |
| `pnpm lint` / `pnpm lint:fix` | Biome check / autofix |
| `pnpm format` | Biome format |
| `pnpm check:comments` | Comment allowlist check |
| `pnpm test` / `pnpm test:watch` | Vitest |
| `pnpm test:e2e` | Playwright |

To refresh the README media, run a server and point the capture script at it:

```bash
node scripts/capture-readme.mjs   # CAPTURE_BASE=http://localhost:3000, CAPTURE_OUT=artifacts/readme
```

It writes the screenshots, `demo.webm`, and the `demo.mp4` / `demo.gif` derived from it. Requires `ffmpeg`.

`node scripts/check-seo.mjs [url]` audits a running server for per-route metadata, `robots.txt`, `sitemap.xml`, and share images.

## Project structure

```
src/
  app/            App Router routes: (app)/ shell group, login, signup, auth/callback;
                  server pages export metadata and render a *-client.tsx; robots.ts,
                  sitemap.ts, opengraph-image.tsx, twitter-image.tsx
  components/
    ui/           shadcn primitives (button, dialog, sheet, slider, tooltip, kbd, skeleton, empty-state)
    layout/       app shell (sidebar, player bar, queue panel, mobile nav)
    features/     feature components (playlist form)
  hooks/          use-audio, use-delayed-flag
  stores/         Zustand (player)
  lib/            utils, query client, Supabase clients, schemas, queries, iTunes, site metadata, data
  types/          shared types
docs/             wiki (stack, architecture, design system, workflows, roadmap)
e2e/              Playwright specs
supabase/         migrations + seed
scripts/          check-comments.mjs, check-seo.mjs, capture-readme.mjs
```

## Docs

- [docs/README.md](docs/README.md) — wiki index
- [docs/stack.md](docs/stack.md) — what we use and why
- [docs/architecture.md](docs/architecture.md) — app structure and data flow
- [docs/design-system.md](docs/design-system.md) — tokens, components, motion
- [docs/workflows.md](docs/workflows.md) — dev commands and PR flow
- [docs/roadmap.md](docs/roadmap.md) — the multi-phase plan

## Contributing

1. Branch from `main`: `feat/phase-N-...` or `fix/...`.
2. One focused change per commit (conventional commits: `feat:`, `fix:`, `chore:`).
3. Run the full check before pushing: `pnpm typecheck && pnpm lint && pnpm check:comments && pnpm test && pnpm build`.
4. Open a PR. CI must pass (typecheck, lint, comments, test, build). Squash-merge after green; delete the branch.

Notes for contributors
- Comment policy: only allowlisted comments (SPDX/license, biome-ignore, @ts-expect-error, TODO/FIXME with an issue number, public JSDoc). Everything else is rejected by `pnpm check:comments`. Keep code self-documenting; comment only a non-obvious *why*.
- Pre-commit (Husky + lint-staged) runs Biome on staged files.
- Verification skill and feature map live under [.opencode/skills/verify-sunao/](.opencode/skills/verify-sunao/); keep them current when you add a feature.

## Status

Phases 0–6 are complete and deployed to https://sunao-omega.vercel.app. Work after the
original plan (real iTunes artwork and previews, motion polish, queue virtualization, the
collapsible queue panel, and SEO/discoverability) shipped on top of it. See
[docs/roadmap.md](docs/roadmap.md).
