import { PLAYLISTS } from "@/lib/data/songs";
import type { Playlist } from "@/lib/schemas";

let local: Playlist[] = [...PLAYLISTS];

export function listLocalPlaylists() {
  return local;
}

export function addLocalPlaylist(playlist: Playlist) {
  local = [...local, playlist];
}
