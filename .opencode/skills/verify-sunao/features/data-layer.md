# Data layer

Songs, albums, and playlists load via TanStack Query with Supabase fallback to static data.

## Sub-features
- `data-songs` loads the song list.
- `data-albums` loads albums.
- `data-fallback` uses static data when Supabase env is absent.

## How to get to it (user POV)
- Open `http://localhost:3000/`. Songs and albums render.

## Driving it with Playwright
Preconditions:
- sunao dev server healthy at `http://localhost:3000`.

- **Load home.** Navigate to `/`. Run `page.goto("/")`. Songs and albums render.
- **Proof.** Capture screenshot. Run `page.screenshot({ path: "artifacts/verify-phase2/home.png" })`.

## Gotchas
- Without Supabase env vars, static data is used.
- Zod validates all rows; a schema mismatch throws.
