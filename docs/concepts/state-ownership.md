# Concept: state ownership

Every piece of UI state has exactly one owner. Get this wrong and the same fact lives in
two places, they drift, and you spend a day debugging why the heart shows red for a song
that is not in Liked Songs.

This app answers "who owns what" with three owners — map any new state onto one of them
before writing a line:

| Owner | State | Where it lives |
|---|---|---|
| **TanStack Query** (`lib/queries.ts`) | the catalogue (songs, albums) and the library (playlists, likes) | server state, or anything persisted |
| **Zustand** (`stores/player.ts`) | playback only: current song, play/pause, position, duration, speed, queue | in memory, never persisted |
| **Component state** | ephemeral UI: form open, sheet open, queue collapsed, search box value | `useState`, local to the component |

## Why the catalogue never lives in the store

The player store knows nothing about songs — only ids. `currentSongId: 7` means nothing by
itself. Components resolve id → song through the same query hooks (`useSongs`) that rendered
the list in the first place. That is the "single source of truth" sentence made literal:
there is one place to fetch songs from, and everything that needs songs asks it.

Two code points enforce it:

- `PlayerProvider` seeds the *queue* from `useSongs()` when the queue is empty — it passes
  ids only, never song objects.
- `useAudio` receives the store's `currentSongId` but resolves the song by looking it up in
  the catalogue (`useSongs()`), one derivation, no copy.

## Why likes moved out of the store

Earlier the heart was `liked: Set<number>` inside the player store. It was media state that
wasn't media state — it is *library* state: it outlives the tab, it must survive a reload,
and it has to agree with the "Liked Songs" playlist. A Zustand store is an in-memory cache,
so persisting anything inside it is a lie the next reload will expose.

Likes now live behind the repository seam (see [persistence.md](persistence.md)) and reach
the UI through a query key (`["liked-songs"]`). The player shrank to playback state only,
and the heart and the Liked Songs playlist read the same source, so they can only agree.

## The pattern to remember

Ask of a new piece of state: *does it survive a reload, and does more than one feature read
it?* Both yes → repository/query. Only one feature, session of the page → component state.
Only about media intent → the player store.
