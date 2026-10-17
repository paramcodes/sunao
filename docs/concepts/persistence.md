# Concept: the repository seam

One port, two adapters, and a factory — the smallest pattern that made persistence (roadmap
post-MVP phase 8) possible without rewriting the UI.

## The seam

`src/lib/library/repo.ts` declares the contract the rest of the app is allowed to know:

```ts
export type LibraryRepo = {
  listPlaylists(): Promise<Playlist[]>;
  createPlaylist(input: { name: string }): Promise<Playlist>;
  renamePlaylist(id: string, name: string): Promise<void>;
  deletePlaylist(id: string): Promise<void>;
  setPlaylistSongs(id: string, songIds: number[]): Promise<void>;
  likedSongIds(): Promise<number[]>;
  setLiked(songId: number, liked: boolean): Promise<void>;
};

export function createRepo(): LibraryRepo {
  return hasSupabase() ? createSupabaseRepo() : createLocalRepo();
}
```

Everything above this line (query hooks, pages) calls `createRepo().<method>` and never
asks *where* the data is stored. Everything below it knows storage only. Swapping the
backend changes nothing above the seam.

## Adapter 1: one versioned localStorage document

`local-repo.ts` stores the whole library as a single JSON document under one key,
`sunao.library.v1` — a version number inside the document, not the key version bumps with
each migration. One document instead of one row per playlist keeps reads atomic: no
half-written combination of a playlist and its song list.

Every read is parsed with Zod and *falls back to the bundled seed* on corrupt or absent
data. Wrong-but-missing is handled; wrong-but-parsed is impossible. Three details worth
stealing:

- A module-level cache keyed by the raw string (`cachedDocRaw`) skips re-parsing identical
  JSON on every read.
- The `storage` event drops the cache when another tab writes the same key — two tabs stay
  in sync without a message channel.
- The `visibilitychange` listener refreshes on tab refocus for the same reason.

## Adapter 2: Supabase at parity

`supabase-repo.ts` implements the same methods against `playlists`, `playlist_songs`, and
the `liked_songs` table (`supabase/migrations/0003_liked_songs.sql`). RLS scopes every row
to `auth.uid()`, so the adapter needs no own-ownership logic — the *database* is the guard.
Likes are stored with a `liked_at` timestamp, which gives the Liked Songs playlist a stable
order for free.

## Optimistic updates on top

The query layer (`lib/queries.ts`) wraps the seam in mutations with three hooks:

- `onMutate` — cancel in-flight queries for that key and paint the intended end state now;
- `onError` — roll the key back to the snapshot `onMutate` returned;
- `onSettled` — invalidate, so the next render refetches and the optimistic paint is replaced
  by the truth.

That is why the heart pops instantly even when the write goes to Postgres, and rolls back
visibly when the write fails.

## What this killed

Before the seam there were three uncoordinated stores — an in-memory Zustand `Set` for
likes, a module-level array (`lib/local-playlists.ts`) for playlists, and Supabase rows.
Liking a song never reached the playlist, and playlist edits vanished on reload. One port
with two adapters resolved *both* bugs by removing the places they could happen (open bugs
A and B in `docs/roadmap-post-mvp.md`).
