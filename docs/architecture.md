# Architecture

## App shell
The shell (sidebar, queue, player bar, mobile nav) lives in the route-group layout `src/app/(app)/layout.tsx`, so it mounts once and persists across navigation — only the page's `<main>` swaps. `/login` and `/signup` sit outside the group with their own centered layout; `/about` is a thin server page (route metadata) around `about-client.tsx`. Route URLs are unchanged by the group.
```
┌─────────────────────────────────────────────┐
│ Sidebar │        Main content        │ Queue │
│ (nav +  │  (pages: home/search/      │ (now  │
│  lists) │   library/playlist)        │ play  │
│         │                            │ +q,   │
│         │                            │toggle)│
├─────────┴────────────────────────────┴──────┤
│               Player bar                    │
├─────────────────────────────────────────────┤
│  Mobile nav (Home/Search/Library/Queue)     │
└─────────────────────────────────────────────┘
```
Below `lg` the sidebar and queue are `hidden`; the mobile nav replaces the sidebar and opens the queue in a bottom sheet (`ui/sheet.tsx`). Both `Sidebar`/`QueuePanel` and `MobileNav`/`sheet` render the same queue content, so `QueueContent` is exported from `queue-panel.tsx` and reused.

Above `lg` the queue panel is collapsible. A button in a header row at the top of the panel toggles it, and the column narrows to a 40px rail instead of unmounting, so the button stays reachable and the virtualizer keeps its measured scroll height. The state is local to `QueuePanel`; the collapsed content is `inert`, which drops it from the tab order and the accessibility tree while preserving scroll position.

`QueryClientProvider` (`components/providers.tsx`), the audio engine (`components/player-provider.tsx`), the Space-bar shortcut (`components/keyboard-shortcuts.tsx`), and the `sonner` `Toaster` are all mounted from the root layout, above the route groups. The root layout also exports the site metadata and issues `prefetchDNS`/`preconnect` hints for the iTunes API and Supabase hosts.

## Ownership of state
Three owners, no overlaps — see [concepts/state-ownership.md](concepts/state-ownership.md) for the reasoning:

- **Zustand (playback only)**: `stores/player.ts` holds `currentSongId`, `isPlaying`, `isBuffering`, `position`, `duration`, `speed`, and `queue` (ids). It starts empty and knows nothing about the catalogue; components resolve ids through query hooks. It also renders the idle state: transport controls are inert and Space is a no-op until a track is chosen (`currentSongId !== null`).
- **TanStack Query (catalogue + library)**: songs, albums, playlists, and likes. The library calls go through the repository seam ([concepts/persistence.md](concepts/persistence.md)).
- **Component state**: search input, sheet open, queue collapsed, form open.

## Playback timing
The seek bar's `max` and the total-time label come from the **audio element's real duration** (`duration` in the store, set from `loadedmetadata`/`durationchange`), not from the song metadata. Song metadata durations describe the full track; the app plays 30-second iTunes previews, so the two disagree and seeking against the metadata length would jump past the end of the audio. The slider clamps to `max || 1` so a 0/N duration cannot wedge it.

While a track is loading the play button swaps to a spinner. That flag is debounced 200ms (`use-delayed-flag.ts`) so a preview that loads instantly never flashes a spinner.

The mobile seek bar drags a local value and commits to the store on release (`onValueCommitted`), so scrubbing never fights the audio element.

## Folders
- `src/app/` — root layout, `(app)/` route group (shell layout, home, search, library, playlist), `about/`, `auth/callback`, `login`, `signup`, `globals.css`, `robots.ts`, `sitemap.ts`.
- `src/components/ui/` — shadcn primitives on Base UI (button, dialog, sheet, slider, input, tooltip, kbd, skeleton, empty-state).
- `src/components/layout/` — app shell pieces (sidebar, player bar, queue panel, mobile nav).
- `src/components/features/` — feature components (`PlaylistForm`).
- `src/components/` — cross-cutting providers (`providers`, `player-provider`, `keyboard-shortcuts`).
- `src/hooks/` — reusable hooks (`use-audio`, `use-delayed-flag`).
- `src/stores/` — Zustand stores (player).
- `src/lib/library/` — the repository seam: `repo.ts` (port), `local-repo.ts` (localStorage), `supabase-repo.ts` (Supabase).
- `src/lib/` — utils, query client, Supabase clients + row helpers, schemas, queries, the iTunes client, `greeting.ts`, `site.ts`, and the bundled dataset.
- `src/types/` — shared types (re-exported from the Zod schemas).
- `docs/` — this wiki.

## Data flow
- Player state lives in Zustand (`stores/player.ts`) and starts empty.
- `PlayerProvider` seeds the queue from `useSongs()` the first time it is empty, so the queue works with either data source.
- Server state (songs, albums) goes through TanStack Query + Supabase, or the bundled dataset when `hasSupabase()` is false.
- Library state (playlists, likes) goes through query hooks that call the repo: `createPlaylist`, `setPlaylistSongs`, `setLiked`. Likes and playlist edits are optimistic (paint now, roll back on error, invalidate after).
- A `useAudio` hook owns the `HTMLAudioElement` and syncs it with the store (play/pause/seek/rate). It resolves songs through `useSongs()` and fetches previews from the iTunes Search API.
- UI state (queue collapsed, mobile sheet open, active view) lives in component state.

## Without a backend
`hasSupabase()` gates everything. When `NEXT_PUBLIC_SUPABASE_URL` is unset:

- Catalogue queries resolve from the bundled dataset in `lib/data/`, each seeded as `initialData` so the server and the first client render agree — without it, a query-backed list renders empty on the server and populated on the client, which is a hydration mismatch.
- The library (playlists + likes) goes to one versioned Zod-validated localStorage document (`sunao.library.v1`), corrupt/absent values falling back to the bundled seed. Changes survive a reload and sync across tabs (`storage` event) — the store-then-reload bugs are gone.
- The system "Liked Songs" playlist still shows its seeded list; making it a live projection of likes is phase 9 in `roadmap-post-mvp.md`, deliberately not done yet in this tree.

With Supabase configured, the same calls hit `playlists`, `playlist_songs`, and the `liked_songs` table (migration `0003_liked_songs.sql`) under RLS. The seed (`supabase/seed.sql`) is aligned with `src/lib/data/songs.ts` so both modes render the same catalogue, including artwork (see `supabase/migrations/0002_artwork.sql`).

## Discoverability surface
The app is crawlable without JavaScript: root metadata + per-route metadata (`about`), `robots.ts` (search crawlers allowed, AI-search crawlers explicitly allowed, model-training crawlers denied), `sitemap.ts`, JSON-LD (FAQ + WebApplication) on `/about`, `public/llms.txt` and `public/llms-full.txt` for answer engines. What it all means and how to measure it for real: [concepts/seo-and-ai-discovery.md](concepts/seo-and-ai-discovery.md).

Search and long song lists are cheap on purpose: the search page filters paintings through `useDeferredValue` so typing stays responsive, and `.song-row` uses `content-visibility: auto` so off-screen rows skip layout and paint.

## Boundaries
- Auth is the only server round trip the client does not own end to end: `src/proxy.ts` refreshes the session cookie and redirects unauthenticated visits to `/library` and `/playlist/*` to `/login`.
- Supabase is the only backend. The client talks to Supabase directly under RLS; there is no custom API server for the MVP.
- Validation of Supabase rows happens with Zod at the query layer; localStorage documents are validated the same way at every read.
