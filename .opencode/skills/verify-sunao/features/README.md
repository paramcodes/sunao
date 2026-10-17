# sunao verification map

Maintained source for verifying user-facing behavior of sunao.

## Baseline preconditions
- Launch sunao with `pnpm dev` (Next.js dev server). Default base: `http://localhost:3000`.
- If port 3000 is held by a process you did not start (a concurrent agent, a stale server), start yours explicitly and use that base everywhere:
  `pnpm exec next dev --turbopack --port 3001`. Check the owner before driving:
  `readlink /proc/$(ss -ltnp | grep ':3000' | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2)/cwd`
- Run `pnpm build && pnpm start` first if checking production behavior.
- Never drive an instance not started by this verification run.
- `discoverability` additionally needs `NEXT_PUBLIC_SITE_URL` set to the served origin (see that recipe).
- No Supabase env vars are required. Without them the app uses the bundled dataset, an in-memory playlist store, and no auth.

## Driving conventions
- Start every recipe from the baseline state.
- Prefer ARIA roles and accessible names over CSS selectors, and scope them: the queue panel repeats song titles as buttons, and the sidebar repeats playlist names, so unscoped `getByRole("button", { name })` queries match several elements. Scope to `main`, `[data-slot="player-bar"]`, or `#queue-panel-content`.
- Run browser actions through Playwright (`e2e/` specs or a short node script importing `chromium` from `@playwright/test` and running inside the repo, where the module resolves).

## Proof and skip reporting
- Capture the user action and resulting state.
- UI proof includes a screenshot with the app identity visible.
- Record the feature ID with every artifact.
- Evidence goes to `artifacts/verify-<feature-id>/`; keep it, do not commit run notes.

## Known product gap (reported 2026-10-17)
- Without Supabase, creating a playlist succeeds and it appears in `/library` and the sidebar, but opening it renders "404: This page could not be found". Cause: `/playlist/[id]` resolves the id server-side from the static `PLAYLISTS` and calls `notFound()`, while the created playlist exists only in the client store. See `library-playlists.md` for how the recipe handles it.

## Features
- [Home renders](./home-renders.md) — greeting, album grid, song list, app shell.
- [Search](./search.md) — filter songs by title or artist, empty state.
- [Library and playlists](./library-playlists.md) — list and create playlists, playlist detail, play all, remove.
- [Player bar](./player-bar.md) — playback controls, seek, speed, like, buffering.
- [Queue and mobile shell](./queue-and-mobile.md) — queue panel, collapse, bottom nav, queue sheet.
- [Auth](./auth.md) — sign in / sign up, route protection, backend-less behavior.
- [Data layer](./data-layer.md) — songs, albums, playlists, fallback dataset.
- [Discoverability](./discoverability.md) — metadata, robots.txt, sitemap.xml, share images, JSON-LD.
