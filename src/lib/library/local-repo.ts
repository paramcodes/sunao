import { z } from "zod";
import { PlaylistSchema } from "@/lib/schemas";
import {
  bundledLikedSongIds,
  bundledPlaylists,
  LIBRARY_STORAGE_KEY,
  type LibraryRepo,
  NEW_PLAYLIST_COVER,
} from "./repo";

const LibraryDocSchema = z.object({
  version: z.literal(1),
  playlists: PlaylistSchema.array(),
  likedSongIds: z.number().array(),
});

type LibraryDoc = z.infer<typeof LibraryDocSchema>;

function seedDoc(): LibraryDoc {
  return {
    version: 1,
    playlists: bundledPlaylists(),
    likedSongIds: bundledLikedSongIds(),
  };
}

let cachedDoc: LibraryDoc | null = null;
let cachedDocRaw: string | null | undefined;

function readDoc(): LibraryDoc {
  if (typeof window === "undefined") return seedDoc();
  try {
    const raw = window.localStorage.getItem(LIBRARY_STORAGE_KEY);
    if (raw === cachedDocRaw && cachedDoc) return cachedDoc;
    cachedDocRaw = raw;
    if (!raw) {
      cachedDoc = seedDoc();
      return cachedDoc;
    }
    const parsed = LibraryDocSchema.safeParse(JSON.parse(raw));
    if (parsed.success) {
      cachedDoc = parsed.data;
      return cachedDoc;
    }
  } catch {
    // Corrupt JSON / storage unavailable: fall through to the bundled seed.
  }
  cachedDoc = seedDoc();
  cachedDocRaw = null;
  return cachedDoc;
}

function writeDoc(doc: LibraryDoc) {
  try {
    window.localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(doc));
  } catch {
    // Ignore storage failures (private mode / quota exceeded).
  }
  cachedDoc = doc;
  try {
    cachedDocRaw = window.localStorage.getItem(LIBRARY_STORAGE_KEY);
  } catch {
    cachedDocRaw = null;
  }
}

function update(fn: (doc: LibraryDoc) => LibraryDoc) {
  writeDoc(fn(readDoc()));
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === LIBRARY_STORAGE_KEY || event.key === null) {
      cachedDoc = null;
      cachedDocRaw = undefined;
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      cachedDoc = null;
      cachedDocRaw = undefined;
    }
  });
}

/** The default backend: one versioned localStorage document. */
export function createLocalRepo(): LibraryRepo {
  return {
    async listPlaylists() {
      return readDoc().playlists;
    },

    async getPlaylist(id) {
      return readDoc().playlists.find((playlist) => playlist.id === id) ?? null;
    },

    async createPlaylist({ name }) {
      const playlist = PlaylistSchema.parse({
        id: crypto.randomUUID(),
        name,
        songIds: [],
        cover: NEW_PLAYLIST_COVER,
        system: false,
      });
      update((doc) => ({ ...doc, playlists: [...doc.playlists, playlist] }));
      return playlist;
    },

    async renamePlaylist(id, name) {
      update((doc) => ({
        ...doc,
        playlists: doc.playlists.map((playlist) =>
          playlist.id === id ? { ...playlist, name } : playlist,
        ),
      }));
    },

    async deletePlaylist(id) {
      update((doc) => ({
        ...doc,
        playlists: doc.playlists.filter((playlist) => playlist.id !== id),
      }));
    },

    async setPlaylistSongs(id, songIds) {
      update((doc) => ({
        ...doc,
        playlists: doc.playlists.map((playlist) =>
          playlist.id === id ? { ...playlist, songIds } : playlist,
        ),
      }));
    },

    async likedSongIds() {
      return readDoc().likedSongIds;
    },

    async setLiked(songId, liked) {
      update((doc) => {
        const alreadyLiked = doc.likedSongIds.includes(songId);
        if (alreadyLiked === liked) return doc;
        return {
          ...doc,
          likedSongIds: liked
            ? [...doc.likedSongIds, songId]
            : doc.likedSongIds.filter((id) => id !== songId),
        };
      });
    },
  };
}
