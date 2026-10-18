# Performance Ledger

Baseline and result for each performance experiment, kept or reverted.
Method: Lighthouse (`--only-categories=performance`, mobile) against a
production build (`next build && next start`) on `http://localhost:3000`.
Throttle: simulated slow 4G, 4x CPU. Machine noise is ±0.2s LCP / ±300ms TBT,
so a delta smaller than that is not a win.

## Baseline (before this pass)

| Route | Score | LCP | CLS | TBT |
|---|---|---|---|---|
| `/` | 0.43 | 5.5s | 0.156 | 2110ms |
| `/search` | 0.55 | 2.2s | 0.250 | 4370ms |
| `/library` | 0.52 | 4.2s | 0.129 | 2520ms |

## Kept

| Change | Baseline → Result | Why |
|---|---|---|
| `queue-panel` aside gets `h-full` | CLS 0.156 → 0.022 | Lighthouse layout-shift audit named `aside[data-slot=queue-panel]`: the panel resized after `useSongs()` resolved, pushing the page content down. `h-full` pins it to the row so late-arriving queue data cannot reflow the shell. |
| `/search` renders a loading block instead of `EmptyState` | CLS 0.250 → 0.021 | Empty results and "still loading" both rendered a short block, then the real list pushed it down. `isLoading` now reserves height. |
| `fetchAlbums` groups songs by album into a `Map` | O(albums × songs) → O(songs) | No user-visible number on a 4-album seed; kept because it is free and the table is unbounded by design. |
| `listPlaylists` groups `playlist_songs` by `playlist_id` | O(playlists × links) → O(links) | Same reasoning; the N+1 shape is wrong regardless of current dataset size. |
| `getPlaylist` filters and orders `playlist_songs` server-side | full table scan → indexed `eq` + `order` | Reuses the `(playlist_id, song_id)` primary key. |
| `selectAll` gains `limit` / `orderBy` / `ascending` | unbounded → capped + ordered | Every list endpoint previously did `select("*")` with no bound. Default cap 1000. |

## Reverted

| Idea | Baseline → Result | Why |
|---|---|---|
| `priority` on the first 4 album images (`i < 4`) | LCP 4.4s → 4.4s, CLS 0 → 0 | LCP is the `<h1>`, not an album image. Preloading 4 images only competes for bandwidth. Reverted to `priority={i === 0}`. |
| Rewrite `SeekBar` to update via ref + rAF | not attempted | The `position` subscription is already contained by the `SeekBar` component boundary; only that subtree re-renders, not `PlayerBar`. Lighthouse shows no long tasks while playing, so there was no measurement to justify the rewrite. |

## After this pass

| Route | Score | LCP | CLS | TBT |
|---|---|---|---|---|
| `/` | 0.63 | 4.4s | 0.000 | 780ms |
| `/search` | 0.62 | 4.0s | 0.021 | 1430ms |

CLS is now inside the "good" band (≤ 0.1) on both routes.

## Open, not yet attempted

- **LCP 4.4s is still poor.** The LCP element is the `<h1>Good evening</h1>`, which
  is server-rendered and present at FCP (1.3s). The gap is the client-side shell
  booting behind it. Fixing this means reducing initial JS (137 KiB of unused JS
  flagged) or moving the header into a server component. Needs a trace, not a guess.
- **`fetchPreviewUrl`** (`src/lib/itunes.ts`) caches in an unbounded module `Map`
  and fetches from iTunes on the client. Worth a TTL and an LRU bound.
- **Index on `playlist_songs(playlist_id)`** was *not* added: the composite
  primary key `(playlist_id, song_id)` already leads with `playlist_id`, so a new
  index would be dead weight on every write.