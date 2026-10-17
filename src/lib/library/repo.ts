import { PLAYLISTS } from "@/lib/data/songs";
import type { Playlist } from "@/lib/schemas";
import { PlaylistSchema } from "@/lib/schemas";
import { hasSupabase } from "@/lib/supabase/client";
import { createLocalRepo } from "./local-repo";
import { createSupabaseRepo } from "./supabase-repo";

/** The one contract for the user's library, whatever backs it. */
export type LibraryRepo = {
  listPlaylists(): Promise<Playlist[]>;
  getPlaylist(id: string): Promise<Playlist | null>;
  createPlaylist(input: { name: string }): Promise<Playlist>;
  renamePlaylist(id: string, name: string): Promise<void>;
  deletePlaylist(id: string): Promise<void>;
  setPlaylistSongs(id: string, songIds: number[]): Promise<void>;
  likedSongIds(): Promise<number[]>;
  setLiked(songId: number, liked: boolean): Promise<void>;
};

export const NEW_PLAYLIST_COVER = "#7f1d1d";
export const LIKED_PLAYLIST_ID = "p1";
export const LIBRARY_STORAGE_KEY = "sunao.library.v1";

export function bundledPlaylists(): Playlist[] {
  return PlaylistSchema.array().parse(PLAYLISTS);
}

export function bundledLikedSongIds(): number[] {
  return bundledPlaylists().find((playlist) => playlist.id === LIKED_PLAYLIST_ID)?.songIds ?? [];
}

export function createRepo(): LibraryRepo {
  return hasSupabase() ? createSupabaseRepo() : createLocalRepo();
}
