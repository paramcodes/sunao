# Library and playlists

The library lists playlists and creates new ones; a playlist detail page shows its tracks with play-all, per-row play, and remove.

## Sub-features
- `library-list` — `/library` lists the playlists with a song count; system playlists are marked `· system`.
- `library-create` — "+ New playlist" reveals an inline name form; creating adds the playlist and fires a success toast.
- `playlist-detail` — cover, name, song count, numbered rows; `Play all`; per-row play; `Remove` on hover.
- `playlist-empty` — "Empty playlist" / "Add songs to get started." when a playlist has no tracks.

## How to get to it (user POV)
- Open `http://localhost:3000/library`. Click a playlist to open `/playlist/<id>`.

## Driving it with Playwright
Preconditions
- Dev server healthy. No auth or Supabase needed; playlists come from the fallback dataset and an in-memory store.
- Scope queries to `main`: the sidebar repeats the playlist list and its own "New playlist" trigger.

- **List.** `page.goto("/library")`. The `Your Library` heading is visible and the seeds `Liked Songs`, `Late Night Drives`, `Workout` are listed with song counts.
- **Create.** In `main`, click `New playlist`; the `Playlist name` textbox appears. Fill `Verify Road Trip` and click `Create`; the toast `Created "Verify Road Trip"` appears and the playlist is listed with `0 songs`.
- **Detail.** Open a seeded playlist (`/playlist/p1`); the heading is `Liked Songs`, `5 songs` is shown, and five rows render.
- **Play all.** Click `Play all`; the player bar shows the first track and its toggle becomes `Pause`.
- **Remove.** Hover a row and click `Remove`; the song count decrements (`5 songs` -> `4 songs`).
- **Empty state.** Remove every row of a playlist (hover each row, click `Remove`); `Empty playlist` and `Add songs to get started.` appear. Removal is client-side state, so a reload restores the playlist.
- **Proof.** Screenshots to `artifacts/verify-library-playlists/`: library with the create form open, a populated detail page, the empty state.

## Known product gap (reported 2026-10-17)
- Opening a playlist created in this session renders `404: This page could not be found`. `/playlist/[id]` resolves the id server-side from the static `PLAYLISTS` and calls `notFound()`, but a new playlist is written only to the client in-memory store, so the server route cannot see it. Creation, listing, and the toast are all fine; only the detail route is broken. Verified at `310c99e`; keep this out of the verification PR and record it for the product owner.

## Gotchas
- Created playlists live in memory only: a page reload drops them and `/playlist/<new-id>` stays 404.
- `Remove` is client state, not a Supabase mutation; it does not survive a reload, and it is not the same as the roadmap's descoped persisted-likes work.
