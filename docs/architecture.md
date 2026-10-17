# Architecture

## App shell
The shell (sidebar, queue, player bar, mobile nav) lives in the route-group layout `src/app/(app)/layout.tsx`, so it mounts once and persists across navigation — only the page's `<main>` swaps. `/login` and `/signup` sit outside the group with their own centered layout. Route URLs are unchanged by the group.
```
┌─────────────────────────────────────────────┐
│ Sidebar │        Main content        │ Queue │
│ (nav +  │  (pages: home/search/      │ (now │
│  lists) │   library/playlist)        │ play │
│         │                            │ +q,  │
│         │                            │toggle│
├─────────┴────────────────────────────┴──────┤
│               Player bar                    │
├─────────────────────────────────────────────┤
│  Mobile nav (Home/Search/Library/Queue)     │
└─────────────────────────────────────────────┘
```
Below `lg` the sidebar and queue are `hidden`; the mobile nav replaces the sidebar and opens the queue in a bottom sheet (`ui/sheet.tsx`). Both `Sidebar`/`QueuePanel` and `MobileNav`/`sheet` render the same content, so `QueueContent` is exported from `queue-panel.tsx` and reused.

Above `lg` the queue panel is collapsible. A button in a header row at the top of the panel toggles it, and the column narrows to a 40px rail instead of unmounting so the button stays reachable and the virtualizer keeps its measured scroll height. The state is local to `QueuePanel`; the collapsed content is `inert`, which drops it from the tab order and the accessibility tree while preserving scroll position.

## Playback timing
The seek bar's `max` and the total-time label come from the **audio element's real duration** (`duration` in the store, set from `loadedmetadata`/`durationchange`), not from the song metadata. Song metadata durations describe the full track; the app plays 30-second iTunes previews, so the two disagree and seeking against the metadata length would jump past the end of the audio.

## Folders
- `src/app/` — root layout, `(app)/` route group (shell layout + pages), auth pages, globals.css.
- `src/components/ui/` — shadcn primitives.
- `src/components/layout/` — app shell pieces (sidebar, player bar, queue panel, mobile nav).
- `src/components/features/` — feature components (`PlaylistForm`, ...).
- `src/stores/` — Zustand stores (player, ui).
- `src/hooks/` — reusable hooks (usePlayer, useAudio).
- `src/lib/` — utils, query client, supabase client.
- `src/types/` — shared types.
- `docs/` — this wiki.

## Data flow
- Player state (current song, play/pause, position, duration, speed, queue, liked) lives in Zustand (`stores/player.ts`).
- Server state (songs, playlists, user) via TanStack Query + Supabase.
- Audio element controlled by a `useAudio` hook that syncs with the store (play/pause/seek/rate).
- UI state (sidebar collapsed, now-playing open, active view) in Zustand or local component state.

## Without a backend
`hasSupabase()` gates every query. When `NEXT_PUBLIC_SUPABASE_URL` is unset, queries resolve from the bundled dataset in `lib/data/`, and created playlists go to an in-memory store in `lib/local-playlists.ts`. Each query seeds `initialData` from that dataset so the server and the first client render agree — without it, a query-backed list renders empty on the server and populated on the client, which is a hydration mismatch.

The Supabase seed (`supabase/seed.sql`) is aligned with `src/lib/data/songs.ts` so both modes render the same catalogue, including artwork (see `supabase/migrations/0002_artwork.sql`).

Liked state is session-only (an in-memory Zustand `Set`); it is not persisted to Supabase and does not sync to the `Liked Songs` playlist. See roadmap descoped items.

## Boundaries
- Supabase is the only backend. Client talks to Supabase directly via RLS; no custom API server for MVP.
- Validation of Supabase responses happens with Zod at the query layer.
