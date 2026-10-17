import { PlaylistSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/client";
import { type SupabaseClient, selectAll } from "@/lib/supabase/rows";
import { type LibraryRepo, NEW_PLAYLIST_COVER } from "./repo";

async function requireUserId(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error("Sign in to change your library");
  return userId;
}

function embeddedSongIds(row: Record<string, unknown>) {
  if (Array.isArray(row.songIds)) return row.songIds;
  if (Array.isArray(row.song_ids)) return row.song_ids;
  return undefined;
}

function orderLinks(links: Record<string, unknown>[]) {
  return links
    .toSorted((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0))
    .map((link) => Number(link.song_id))
    .filter((value) => Number.isFinite(value));
}

/** Playlists and likes in Postgres, under RLS. */
export function createSupabaseRepo(): LibraryRepo {
  return {
    async listPlaylists() {
      const supabase = createClient();
      const rows = await selectAll(supabase, "playlists", { orderBy: "id" });
      const needsLinks = rows.some((row) => embeddedSongIds(row) === undefined);
      const links = needsLinks
        ? await selectAll(supabase, "playlist_songs", { orderBy: "playlist_id" })
        : [];
      const linksByPlaylist = new Map<string, Record<string, unknown>[]>();
      for (const link of links) {
        const pid = link.playlist_id;
        if (typeof pid !== "string" && typeof pid !== "number") continue;
        const key = String(pid);
        const bucket = linksByPlaylist.get(key);
        if (bucket) bucket.push(link);
        else linksByPlaylist.set(key, [link]);
      }
      const prepared = rows.map((row) => ({
        id: row.id,
        name: row.name,
        songIds: embeddedSongIds(row) ?? orderLinks(linksByPlaylist.get(String(row.id)) ?? []),
        cover: row.cover,
        system: row.system,
      }));
      return PlaylistSchema.array().parse(prepared);
    },

    async getPlaylist(id) {
      const supabase = createClient();
      const { data: row, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!row) return null;

      let songIds = embeddedSongIds(row);
      if (songIds === undefined) {
        const { data, error } = await supabase
          .from("playlist_songs")
          .select("*")
          .eq("playlist_id", id)
          .order("position", { ascending: true });
        if (error) throw error;
        const links = (Array.isArray(data) ? data : data ? [data] : []) as Record<
          string,
          unknown
        >[];
        songIds = orderLinks(links);
      }

      return PlaylistSchema.parse({
        id: row.id,
        name: row.name,
        songIds,
        cover: row.cover,
        system: row.system,
      });
    },

    async createPlaylist({ name }) {
      const supabase = createClient();
      const userId = await requireUserId(supabase);
      const id = crypto.randomUUID();
      const { error } = await supabase
        .from("playlists")
        .insert({ id, name, cover: NEW_PLAYLIST_COVER, system: false, owner_id: userId });
      if (error) throw error;
      return PlaylistSchema.parse({
        id,
        name,
        songIds: [],
        cover: NEW_PLAYLIST_COVER,
        system: false,
      });
    },

    async renamePlaylist(id, name) {
      const supabase = createClient();
      await requireUserId(supabase);
      const { error } = await supabase.from("playlists").update({ name }).eq("id", id);
      if (error) throw error;
    },

    async deletePlaylist(id) {
      const supabase = createClient();
      await requireUserId(supabase);
      const { error } = await supabase.from("playlists").delete().eq("id", id);
      if (error) throw error;
    },

    async setPlaylistSongs(id, songIds) {
      const supabase = createClient();
      await requireUserId(supabase);
      const { error: deleteError } = await supabase
        .from("playlist_songs")
        .delete()
        .eq("playlist_id", id);
      if (deleteError) throw deleteError;
      if (songIds.length === 0) return;
      const { error } = await supabase
        .from("playlist_songs")
        .insert(
          songIds.map((songId, position) => ({ playlist_id: id, song_id: songId, position })),
        );
      if (error) throw error;
    },

    async likedSongIds() {
      const supabase = createClient();
      const userId = await requireUserId(supabase);
      const { data, error } = await supabase
        .from("liked_songs")
        .select("song_id")
        .eq("user_id", userId)
        .order("liked_at", { ascending: true });
      if (error) throw error;
      return (data ?? [])
        .map((row) => Number(row.song_id))
        .filter((value) => Number.isFinite(value));
    },

    async setLiked(songId, liked) {
      const supabase = createClient();
      const userId = await requireUserId(supabase);
      if (liked) {
        const { error } = await supabase
          .from("liked_songs")
          .upsert(
            { user_id: userId, song_id: songId },
            { onConflict: "user_id,song_id", ignoreDuplicates: true },
          );
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from("liked_songs")
        .delete()
        .eq("user_id", userId)
        .eq("song_id", songId);
      if (error) throw error;
    },
  };
}
