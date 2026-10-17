# Data layer

Songs, albums, and playlists come from TanStack Query, backed by Supabase when configured and by the bundled dataset otherwise.

## Sub-features
- `data-songs` — the song list renders on `/`.
- `data-albums` — the album grid renders on `/`, with remote artwork.
- `data-playlists` — `/library` and `/playlist/<id>` render playlists from the same layer.
- `data-fallback` — with no Supabase env vars, queries resolve from the static dataset and an in-memory playlist store.

## How to get to it (user POV)
- Open `http://localhost:3000/`, `/library`, or `/playlist/p1`.

## Driving it with Playwright
Preconditions
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be unset so the fallback path is exercised. No `.env.local` should set them.
- Dev server healthy.

- **Home.** `page.goto("/")`; the album grid shows `Abbey Road`, `Rumours`, `Thriller`, `Back In Black`, and the song list shows 12 rows.
- **Artwork.** `page.locator('img[src*="mzstatic"]')` matches several images (remote covers via `next/image`).
- **Playlists.** `page.goto("/library")` lists `Liked Songs`, `Late Night Drives`, `Workout` with no sign-in; `page.goto("/playlist/p1")` shows the `Liked Songs` heading and 5 rows.
- **Proof.** Screenshots to `artifacts/verify-data-layer/`: home grid, library, playlist detail.

## Gotchas
- Every read hook seeds `initialData` from the static dataset when Supabase is absent, so lists are present on the first paint; a loading skeleton on these routes is a regression, not expected behavior.
- Zod parses the static dataset too, so a bad row in `src/lib/data/songs.ts` throws without any Supabase env.
- `next.config.ts` allowlists the mzstatic host for `next/image`; removing it breaks every cover.
- Playlists created in fallback mode go to an in-memory store (`src/lib/local-playlists.ts`) and vanish on reload; their detail route 404s (see `library-playlists.md`).
- `src/proxy.ts` short-circuits without Supabase env vars, so `/library` and `/playlist/*` are not auth-gated in this mode.
