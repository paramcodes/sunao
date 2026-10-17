"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ALBUMS, SONGS } from "@/lib/data/songs";
import { addLocalPlaylist, listLocalPlaylists } from "@/lib/local-playlists";
import type { Album, Playlist, Song } from "@/lib/schemas";
import { AlbumSchema, PlaylistSchema, SongSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/client";

type SupabaseClient = ReturnType<typeof createClient>;

const STALE_TIME = 60_000;
const NEW_PLAYLIST_COVER = "#7f1d1d";

function hasSupabase() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

function localSongs() {
  return SongSchema.array().parse(SONGS);
}

function localAlbums() {
  return AlbumSchema.array().parse(ALBUMS);
}

function localPlaylists() {
  return PlaylistSchema.array().parse(listLocalPlaylists());
}

function localPlaylist(id: string) {
  const playlist = listLocalPlaylists().find((item) => item.id === id);
  return playlist ? PlaylistSchema.parse(playlist) : undefined;
}

async function selectAll(supabase: SupabaseClient, table: string) {
  const { data, error } = await supabase.from(table).select("*");
  if (error) throw error;
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === "object") return [data as Record<string, unknown>];
  return [];
}

async function fetchSongs() {
  if (!hasSupabase()) {
    return localSongs();
  }
  const supabase = createClient();
  const rows = await selectAll(supabase, "songs");
  return SongSchema.array().parse(rows);
}

async function fetchAlbums() {
  if (!hasSupabase()) {
    return localAlbums();
  }
  const supabase = createClient();
  const albumRows = await selectAll(supabase, "albums");
  const needsSongs = albumRows.some((row) => !Array.isArray(row.songs));
  let songRows: Record<string, unknown>[] = [];
  if (needsSongs) {
    songRows = await selectAll(supabase, "songs");
  }
  const prepared = albumRows.map((row) => {
    if (Array.isArray(row.songs)) return row;
    const title = row.title;
    const songs = songRows
      .filter((song) => song.album === title)
      .map((song) => Number(song.id))
      .filter((value) => Number.isFinite(value));
    return { ...row, songs };
  });
  return AlbumSchema.array().parse(prepared);
}

async function fetchPlaylists() {
  if (!hasSupabase()) {
    return localPlaylists();
  }
  const supabase = createClient();
  const playlistRows = await selectAll(supabase, "playlists");
  const needsSongIds = playlistRows.some(
    (row) => !Array.isArray(row.songIds) && !Array.isArray(row.song_ids),
  );
  let linkRows: Record<string, unknown>[] = [];
  if (needsSongIds) {
    linkRows = await selectAll(supabase, "playlist_songs");
  }
  const prepared = playlistRows.map((row) => {
    let songIds: unknown = row.songIds;
    if (!Array.isArray(songIds)) songIds = row.song_ids;
    if (!Array.isArray(songIds)) {
      songIds = linkRows
        .filter((link) => link.playlist_id === row.id)
        .sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0))
        .map((link) => Number(link.song_id))
        .filter((value) => Number.isFinite(value));
    }
    return {
      id: row.id,
      name: row.name,
      songIds,
      cover: row.cover,
      system: row.system,
    };
  });
  return PlaylistSchema.array().parse(prepared);
}

async function fetchPlaylist(id: string) {
  if (!hasSupabase()) {
    const playlist = localPlaylist(id);
    if (!playlist) throw new Error("Playlist not found");
    return playlist;
  }
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from("playlists")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!row) throw new Error("Playlist not found");

  let songIds: unknown = row.songIds;
  if (!Array.isArray(songIds)) songIds = row.song_ids;
  if (!Array.isArray(songIds)) {
    const { data: links, error: linkError } = await supabase
      .from("playlist_songs")
      .select("*")
      .eq("playlist_id", id);
    if (linkError) throw linkError;
    songIds = (links ?? [])
      .sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0))
      .map((link) => Number(link.song_id))
      .filter((value) => Number.isFinite(value));
  }

  return PlaylistSchema.parse({
    id: row.id,
    name: row.name,
    songIds,
    cover: row.cover,
    system: row.system,
  });
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
    queryFn: fetchPlaylists,
    staleTime: STALE_TIME,
    initialData: hasSupabase() ? undefined : localPlaylists,
  });
}

export function usePlaylist(id: string) {
  return useQuery({
    queryKey: ["playlist", id],
    queryFn: () => fetchPlaylist(id),
    staleTime: STALE_TIME,
    initialData: hasSupabase() ? undefined : () => localPlaylist(id),
  });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("A playlist needs a name");

      const id = crypto.randomUUID();
      const draft = {
        id,
        name: trimmed,
        songIds: [],
        cover: NEW_PLAYLIST_COVER,
        system: false,
      };

      if (!hasSupabase()) {
        const playlist = PlaylistSchema.parse(draft);
        addLocalPlaylist(playlist);
        return playlist;
      }

      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      const ownerId = data.user?.id;
      if (!ownerId) throw new Error("Sign in to create a playlist");

      const { error: insertError } = await supabase
        .from("playlists")
        .insert({ ...draft, owner_id: ownerId });
      if (insertError) throw insertError;

      return PlaylistSchema.parse(draft);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}

export type { Album, Playlist, Song };
