"use client";

import { useQuery } from "@tanstack/react-query";
import { ALBUMS, PLAYLISTS, SONGS } from "@/lib/data/songs";
import type { Album, Playlist, Song } from "@/lib/schemas";
import { AlbumSchema, PlaylistSchema, SongSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/client";

type SupabaseClient = ReturnType<typeof createClient>;

const STALE_TIME = 60_000;

function hasSupabase() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
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
    return SongSchema.array().parse(SONGS);
  }
  const supabase = createClient();
  const rows = await selectAll(supabase, "songs");
  return SongSchema.array().parse(rows);
}

async function fetchAlbums() {
  if (!hasSupabase()) {
    return AlbumSchema.array().parse(ALBUMS);
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
    return PlaylistSchema.array().parse(PLAYLISTS);
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
  const playlists = await fetchPlaylists();
  const playlist = playlists.find((item) => item.id === id);
  if (!playlist) throw new Error("Playlist not found");
  return playlist;
}

export function useSongs() {
  return useQuery({
    queryKey: ["songs"],
    queryFn: fetchSongs,
    staleTime: STALE_TIME,
  });
}

export function useAlbums() {
  return useQuery({
    queryKey: ["albums"],
    queryFn: fetchAlbums,
    staleTime: STALE_TIME,
  });
}

export function usePlaylists() {
  return useQuery({
    queryKey: ["playlists"],
    queryFn: fetchPlaylists,
    staleTime: STALE_TIME,
  });
}

export function usePlaylist(id: string) {
  return useQuery({
    queryKey: ["playlist", id],
    queryFn: () => fetchPlaylist(id),
    staleTime: STALE_TIME,
  });
}

export type { Album, Playlist, Song };
