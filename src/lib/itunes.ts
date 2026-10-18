import { ALBUMS, SONGS } from "@/lib/data/songs";
import type { Album, Artist, Song } from "@/types";

const previewCache = new Map<string, string | null>();

function generateColor(str: string): string {
  const hues = [
    "#1e293b",
    "#1e1b4b",
    "#312e81",
    "#1e3a5f",
    "#14532d",
    "#3b1f1f",
    "#2d4a3e",
    "#1a1a2e",
    "#2e1065",
    "#4c0519",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hues[Math.abs(hash) % hues.length];
}

function upgradeArtwork(url?: string): string | undefined {
  if (!url) return undefined;
  return url.replace(/\/\d+x\d+bb\./, "/600x600bb.");
}

interface RawItunesTrack {
  wrapperType?: string;
  kind?: string;
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  trackTimeMillis?: number;
  artworkUrl100?: string;
  previewUrl?: string;
  artistId?: number;
  collectionId?: number;
  primaryGenreName?: string;
}

interface RawItunesCollection {
  wrapperType?: string;
  collectionType?: string;
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100?: string;
  releaseDate?: string;
  artistId?: number;
  primaryGenreName?: string;
}

interface RawItunesArtist {
  wrapperType?: string;
  artistType?: string;
  artistId: number;
  artistName: string;
  primaryGenreName?: string;
}

export function itunesTrackToSong(track: RawItunesTrack): Song {
  return {
    id: track.trackId,
    title: track.trackName || "Untitled",
    artist: track.artistName || "Unknown Artist",
    album: track.collectionName || "Unknown Album",
    duration: track.trackTimeMillis ? Math.round(track.trackTimeMillis / 1000) : 180,
    color: generateColor(track.artistName + track.trackName),
    artwork: upgradeArtwork(track.artworkUrl100),
    previewUrl: track.previewUrl,
    artistId: track.artistId,
    albumId: track.collectionId,
  };
}

export function itunesCollectionToAlbum(col: RawItunesCollection, songIds: number[] = []): Album {
  const year = col.releaseDate ? new Date(col.releaseDate).getFullYear() : 0;
  return {
    id: String(col.collectionId),
    title: col.collectionName || "Untitled Album",
    artist: col.artistName || "Unknown Artist",
    year: Number.isFinite(year) ? year : 0,
    color: generateColor(col.collectionName || String(col.collectionId)),
    artwork: upgradeArtwork(col.artworkUrl100),
    songs: songIds,
    artistId: col.artistId,
  };
}

export function itunesArtistToArtist(artist: RawItunesArtist, artwork?: string): Artist {
  return {
    id: String(artist.artistId),
    name: artist.artistName,
    genre: artist.primaryGenreName,
    artwork,
  };
}

export async function fetchPreviewUrl(title: string, artist: string): Promise<string | null> {
  const key = `${title.trim().toLowerCase()}|${artist.trim().toLowerCase()}`;
  if (previewCache.has(key)) {
    return previewCache.get(key) ?? null;
  }
  try {
    const query = encodeURIComponent(`${title} ${artist}`);
    const sep = "/";
    const url =
      "https:" +
      sep +
      sep +
      "itunes.apple.com" +
      sep +
      "search?term=" +
      query +
      "&media=music&limit=1";
    const response = await fetch(url);
    if (!response.ok) {
      previewCache.set(key, null);
      return null;
    }
    const data = (await response.json()) as { results?: Array<{ previewUrl?: string }> };
    const preview = data.results?.[0]?.previewUrl ?? null;
    previewCache.set(key, preview);
    return preview;
  } catch {
    previewCache.set(key, null);
    return null;
  }
}

export function fallbackSearchSongs(term: string): Song[] {
  const needle = term.trim().toLowerCase();
  if (!needle) return SONGS;
  return SONGS.filter(
    (s) => s.title.toLowerCase().includes(needle) || s.artist.toLowerCase().includes(needle),
  );
}

export function fallbackSearchAlbums(term: string): Album[] {
  const needle = term.trim().toLowerCase();
  if (!needle) return ALBUMS;
  return ALBUMS.filter(
    (a) => a.title.toLowerCase().includes(needle) || a.artist.toLowerCase().includes(needle),
  );
}

export function fallbackSearchArtists(term: string): Artist[] {
  const needle = term.trim().toLowerCase();
  const seen = new Set<string>();
  const artists: Artist[] = [];
  for (const s of SONGS) {
    const lower = s.artist.toLowerCase();
    if ((!needle || lower.includes(needle)) && !seen.has(lower)) {
      seen.add(lower);
      artists.push({
        id: lower.replace(/\s+/g, "-"),
        name: s.artist,
        artwork: s.artwork,
      });
    }
  }
  return artists;
}

export async function searchItunesSongs(
  term: string,
  signal?: AbortSignal,
  limit = 25,
): Promise<Song[]> {
  const query = encodeURIComponent(term.trim());
  if (!query) return [];
  try {
    const url = `https://itunes.apple.com/search?term=${query}&media=music&entity=song&limit=${limit}`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`iTunes search failed: ${res.status}`);
    const data = (await res.json()) as { results?: RawItunesTrack[] };
    const tracks = (data.results ?? []).filter((r) => r.trackId && r.trackName);
    return tracks.map(itunesTrackToSong);
  } catch (err) {
    if (signal?.aborted) throw err;
    return fallbackSearchSongs(term);
  }
}

export async function searchItunesAlbums(
  term: string,
  signal?: AbortSignal,
  limit = 20,
): Promise<Album[]> {
  const query = encodeURIComponent(term.trim());
  if (!query) return [];
  try {
    const url = `https://itunes.apple.com/search?term=${query}&media=music&entity=album&limit=${limit}`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`iTunes search failed: ${res.status}`);
    const data = (await res.json()) as { results?: RawItunesCollection[] };
    const collections = (data.results ?? []).filter(
      (r) => r.collectionId && (r.wrapperType === "collection" || r.collectionType === "Album"),
    );
    return collections.map((col) => itunesCollectionToAlbum(col));
  } catch (err) {
    if (signal?.aborted) throw err;
    return fallbackSearchAlbums(term);
  }
}

export async function searchItunesArtists(
  term: string,
  signal?: AbortSignal,
  limit = 20,
): Promise<Artist[]> {
  const query = encodeURIComponent(term.trim());
  if (!query) return [];
  try {
    const url = `https://itunes.apple.com/search?term=${query}&media=music&entity=musicArtist&limit=${limit}`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`iTunes search failed: ${res.status}`);
    const data = (await res.json()) as { results?: RawItunesArtist[] };
    const artists = (data.results ?? []).filter((r) => r.artistId && r.artistName);
    return artists.map((a) => itunesArtistToArtist(a));
  } catch (err) {
    if (signal?.aborted) throw err;
    return fallbackSearchArtists(term);
  }
}

export async function searchItunesAll(
  term: string,
  signal?: AbortSignal,
): Promise<{ songs: Song[]; albums: Album[]; artists: Artist[] }> {
  try {
    const [songs, albums, artists] = await Promise.all([
      searchItunesSongs(term, signal, 5),
      searchItunesAlbums(term, signal, 6),
      searchItunesArtists(term, signal, 6),
    ]);
    return { songs, albums, artists };
  } catch (err) {
    if (signal?.aborted) throw err;
    return {
      songs: fallbackSearchSongs(term),
      albums: fallbackSearchAlbums(term),
      artists: fallbackSearchArtists(term),
    };
  }
}

export async function fetchItunesAlbum(
  id: string,
  signal?: AbortSignal,
): Promise<{ album: Album; songs: Song[] } | null> {
  const local = ALBUMS.find((a) => a.id === id);
  if (local) {
    const localSongs = SONGS.filter((s) => local.songs.includes(s.id));
    return { album: local, songs: localSongs };
  }
  try {
    const url = `https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}&entity=song`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`iTunes lookup failed: ${res.status}`);
    const data = (await res.json()) as {
      results?: Array<RawItunesCollection & RawItunesTrack>;
    };
    const results = data.results ?? [];
    const collection = results.find((r) => r.wrapperType === "collection");
    if (!collection) return null;
    const rawTracks = results.filter((r) => r.wrapperType === "track");
    const songs = rawTracks.map(itunesTrackToSong);
    const album = itunesCollectionToAlbum(
      collection,
      songs.map((s) => s.id),
    );
    return { album, songs };
  } catch (err) {
    if (signal?.aborted) throw err;
    return null;
  }
}

export async function fetchItunesArtist(
  id: string,
  signal?: AbortSignal,
): Promise<{ artist: Artist; songs: Song[]; albums: Album[] } | null> {
  const decoded = decodeURIComponent(id).toLowerCase().replace(/-/g, " ");
  const localMatch = SONGS.find(
    (s) =>
      s.artist.toLowerCase() === decoded ||
      s.artist.toLowerCase().replace(/\s+/g, "-") === id.toLowerCase(),
  );
  if (localMatch) {
    const localSongs = SONGS.filter(
      (s) => s.artist.toLowerCase() === localMatch.artist.toLowerCase(),
    );
    const localAlbums = ALBUMS.filter(
      (a) => a.artist.toLowerCase() === localMatch.artist.toLowerCase(),
    );
    return {
      artist: {
        id,
        name: localMatch.artist,
        artwork: localMatch.artwork,
      },
      songs: localSongs,
      albums: localAlbums,
    };
  }
  try {
    const [songsRes, albumsRes] = await Promise.all([
      fetch(`https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}&entity=song&limit=20`, {
        signal,
      }),
      fetch(`https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}&entity=album&limit=20`, {
        signal,
      }),
    ]);
    if (!songsRes.ok && !albumsRes.ok) throw new Error("iTunes artist lookup failed");
    const songsData = songsRes.ok
      ? ((await songsRes.json()) as { results?: Array<RawItunesArtist & RawItunesTrack> })
      : { results: [] };
    const albumsData = albumsRes.ok
      ? ((await albumsRes.json()) as { results?: Array<RawItunesArtist & RawItunesCollection> })
      : { results: [] };

    const artistItem =
      songsData.results?.find((r) => r.wrapperType === "artist") ??
      albumsData.results?.find((r) => r.wrapperType === "artist");
    if (!artistItem) return null;

    const rawTracks = (songsData.results ?? []).filter((r) => r.wrapperType === "track");
    const songs = rawTracks.map(itunesTrackToSong);
    const rawAlbums = (albumsData.results ?? []).filter((r) => r.wrapperType === "collection");
    const albums = rawAlbums.map((col) => itunesCollectionToAlbum(col));

    const artist = itunesArtistToArtist(artistItem, songs[0]?.artwork ?? albums[0]?.artwork);
    return { artist, songs, albums };
  } catch (err) {
    if (signal?.aborted) throw err;
    return null;
  }
}
