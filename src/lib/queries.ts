"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ALBUMS, SONGS } from "@/lib/data/songs";
import { bundledLikedSongIds, bundledPlaylists, createRepo } from "@/lib/library/repo";
import type { Album, Playlist, Song } from "@/lib/schemas";
import { AlbumSchema, SongSchema } from "@/lib/schemas";
import { createClient, hasSupabase } from "@/lib/supabase/client";
import { selectAll } from "@/lib/supabase/rows";

const STALE_TIME = 60_000;

const LIBRARY_QUERY = { staleTime: 0, refetchOnMount: "always" } as const;

function localSongs() {
  return SongSchema.array().parse(SONGS);
}

function localAlbums() {
  return AlbumSchema.array().parse(ALBUMS);
}

async function fetchSongs() {
  if (!hasSupabase()) {
    return localSongs();
  }
  const supabase = createClient();
  const rows = await selectAll(supabase, "songs", { orderBy: "id" });
  return SongSchema.array().parse(rows);
}

async function fetchAlbums() {
  if (!hasSupabase()) {
    return localAlbums();
  }
  const supabase = createClient();
  const albumRows = await selectAll(supabase, "albums", { orderBy: "title" });
  const needsSongs = albumRows.some((row) => !Array.isArray(row.songs));
  let songRows: Record<string, unknown>[] = [];
  if (needsSongs) {
    songRows = await selectAll(supabase, "songs", { orderBy: "id" });
  }
  const songsByAlbum = new Map<string, number[]>();
  for (const song of songRows) {
    const albumTitle = song.album;
    if (typeof albumTitle !== "string") continue;
    const id = Number(song.id);
    if (!Number.isFinite(id)) continue;
    const list = songsByAlbum.get(albumTitle);
    if (list) list.push(id);
    else songsByAlbum.set(albumTitle, [id]);
  }
  const prepared = albumRows.map((row) => {
    if (Array.isArray(row.songs)) return row;
    const title = row.title;
    const songs = typeof title === "string" ? (songsByAlbum.get(title) ?? []) : [];
    return { ...row, songs };
  });
  return AlbumSchema.array().parse(prepared);
}

export function useSongs() {
  return useQuery({
    queryKey: ["songs"],
    queryFn: fetchSongs,
    staleTime: STALE_TIME,
    initialData: hasSupabase() ? undefined : localSongs,
  });
}

export function useAlbums() {
  return useQuery({
    queryKey: ["albums"],
    queryFn: fetchAlbums,
    staleTime: STALE_TIME,
    initialData: hasSupabase() ? undefined : localAlbums,
  });
}

export function usePlaylists() {
  return useQuery({
    queryKey: ["playlists"],
    queryFn: () => createRepo().listPlaylists(),
    initialData: hasSupabase() ? undefined : bundledPlaylists,
    ...LIBRARY_QUERY,
  });
}

export function usePlaylist(id: string) {
  return useQuery({
    queryKey: ["playlist", id],
    queryFn: () => createRepo().getPlaylist(id),
    initialData: hasSupabase()
      ? undefined
      : () => bundledPlaylists().find((playlist) => playlist.id === id),
    ...LIBRARY_QUERY,
  });
}

export function useIsLiked(songId: number) {
  return useQuery({
    queryKey: ["liked-songs"],
    queryFn: () => createRepo().likedSongIds(),
    initialData: hasSupabase() ? undefined : bundledLikedSongIds,
    ...LIBRARY_QUERY,
    select: (ids: number[]) => ids.includes(songId),
  });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("A playlist needs a name");
      return createRepo().createPlaylist({ name: trimmed });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}

export function useSetPlaylistSongs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, songIds }: { id: string; songIds: number[] }) =>
      createRepo().setPlaylistSongs(id, songIds),
    onMutate: async ({ id, songIds }) => {
      const key = ["playlist", id];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Playlist>(key);
      if (previous) queryClient.setQueryData<Playlist>(key, { ...previous, songIds });
      return { id, previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["playlist", context.id], context.previous);
      }
    },
    onSettled: (_data, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["playlist", id] });
      void queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}

export function useSetLiked() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ songId, liked }: { songId: number; liked: boolean }) =>
      createRepo().setLiked(songId, liked),
    onMutate: async ({ songId, liked }) => {
      const key = ["liked-songs"];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<number[]>(key);
      queryClient.setQueryData<number[]>(key, (ids = []) =>
        liked ? (ids.includes(songId) ? ids : [...ids, songId]) : ids.filter((id) => id !== songId),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context) queryClient.setQueryData(["liked-songs"], context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["liked-songs"] });
    },
  });
}

export type { Album, Playlist, Song };
