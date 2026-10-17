# Architecture

## App shell
The shell (sidebar, queue, player bar, mobile nav) lives in the route-group layout `src/app/(app)/layout.tsx`, so it mounts once and persists across navigation — only the page's `<main>` swaps. `/login` and `/signup` sit outside the group with their own centered layout. Route URLs are unchanged by the group.
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

`QueryClientProvider` (`components/providers.tsx`), the audio engine (`components/player-provider.tsx`), the Space-bar shortcut (`components/keyboard-shortcuts.tsx`), and the `sonner` `Toaster` are all mounted from the root layout, above the route groups.

## Playback timing
The seek bar's `max` and the total-time label come from the **audio element's real duration** (`duration` in the store, set from `loadedmetadata`/`durationchange`), not from the song metadata. Song metadata durations describe the full track; the app plays 30-second iTunes previews, so the two disagree and seeking against the metadata length would jump past the end of the audio.

While a track is loading the play button swaps to a spinner. That flag is debounced 200ms (`use-delayed-flag.ts`) so a preview that loads instantly never flashes a spinner.

## Folders
- `src/app/` — root layout, `(app)/` route group (shell layout, home, search, library, playlist), `auth/callback`, `login`, `signup`, `globals.css`, and the metadata routes (`robots.ts`, `sitemap.ts`, `opengraph-image.tsx`, `twitter-image.tsx`).
- `src/components/ui/` — shadcn primitives on Base UI.
- `src/components/layout/` — app shell pieces (sidebar, player bar, queue panel, mobile nav).
- `src/components/features/` — feature components (`PlaylistForm`).
- `src/components/` — cross-cutting providers (`providers`, `player-provider`, `keyboard-shortcuts`).
- `src/hooks/` — reusable hooks (`use-audio`, `use-delayed-flag`).
- `src/stores/` — Zustand stores (player).
- `src/lib/` — utils, query client, Supabase clients, schemas, queries, the iTunes client, the local-playlist store, site metadata (`site.ts`), and the bundled dataset.
- `src/types/` — shared types (re-exported from the Zod schemas).
- `docs/` — this wiki.

## Data flow
- Player state lives in Zustand (`stores/player.ts`): current song id, play/pause, buffering, position, duration, speed, queue (ids), and likes. The store starts empty and knows nothing about the catalogue.
- `PlayerProvider` seeds the queue from `useSongs()` the first time it is empty, so the queue works with either data source.
- Server state (songs, albums, playlists) goes through TanStack Query + Supabase. Components resolve the current and queued songs by id through the same query hooks.
- A `useAudio` hook owns the `HTMLAudioElement` and syncs it with the store (play/pause/seek/rate), fetching each preview from the iTunes Search API.
- UI state (queue collapsed, mobile sheet open, active view) lives in component state.

## Metadata and SEO
Each route is a server component that exports `metadata` and renders a client component (`HomeClient`, `SearchClient`, `LibraryClient`, `PlaylistClient`, `LoginClient`, `SignupClient`) which owns the interactive state, so metadata resolves on the server. Playlist pages build their own metadata and emit `MusicRecording` JSON-LD. `src/lib/site.ts` holds the canonical `SITE_URL`, name, and default description, so `robots.ts`, `sitemap.ts`, and the share images agree on one origin. `sitemap.ts` is built from the playlist catalogue; library, login, and signup are `noindex`, and `robots.txt` disallows `/auth/`.

## Without a backend
`hasSupabase()` gates every query. When `NEXT_PUBLIC_SUPABASE_URL` is unset, queries resolve from the bundled dataset in `lib/data/`, and created playlists go to an in-memory store in `lib/local-playlists.ts`. Each query seeds `initialData` from that dataset so the server and the first client render agree — without it, a query-backed list renders empty on the server and populated on the client, which is a hydration mismatch.

The Supabase seed (`supabase/seed.sql`) is aligned with `src/lib/data/songs.ts` so both modes render the same catalogue, including artwork (see `supabase/migrations/0002_artwork.sql`).

Liked state is session-only (an in-memory Zustand `Set`); it is not persisted to Supabase and does not sync to the `Liked Songs` playlist. See the roadmap descoped items.

## Boundaries
- Auth is the only server round trip the client does not own end to end: `src/proxy.ts` refreshes the session cookie and redirects unauthenticated visits to `/library` and `/playlist/*` to `/login`.
- Supabase is the only backend. The client talks to Supabase directly under RLS; there is no custom API server for the MVP.
- Validation of Supabase responses happens with Zod at the query layer.
