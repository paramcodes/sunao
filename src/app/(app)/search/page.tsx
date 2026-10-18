import type { Metadata } from "next";
import SearchPage from "./search-client";

import { Clock, Disc3, Mic2, Music, Play, Search as SearchIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fallbackSearchAlbums,
  fallbackSearchArtists,
  fallbackSearchSongs,
  searchItunesAlbums,
  searchItunesAll,
  searchItunesArtists,
  searchItunesSongs,
} from "@/lib/itunes";
import { usePlaylists } from "@/lib/queries";
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
} from "@/lib/recent-searches";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/stores/player";
import type { Album, Artist, Playlist, Song } from "@/types";

type SearchCategory = "all" | "songs" | "albums" | "artists" | "playlists";

const CATEGORIES: Array<{ id: SearchCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "songs", label: "Songs" },
  { id: "albums", label: "Albums" },
  { id: "artists", label: "Artists" },
  { id: "playlists", label: "Playlists" },
];

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<SearchCategory>("all");
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [matchedPlaylists, setMatchedPlaylists] = useState<Playlist[]>([]);

  const play = usePlayer((s) => s.play);
  const setQueue = usePlayer((s) => s.setQueue);
  const registerSongs = usePlayer((s) => s.registerSongs);
  const { data: allPlaylists = [] } = usePlaylists();

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setRecent(getRecentSearches());
    const handleUpdate = () => setRecent(getRecentSearches());
    window.addEventListener("sunao:recent-searches", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("sunao:recent-searches", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handlePlaySong = (song: Song, list: Song[]) => {
    registerSongs(list);
    setQueue(list.map((s) => s.id));
    play(song);
    if (q.trim()) {
      addRecentSearch(q.trim());
    }
  };

  useEffect(() => {
    const trimmed = q.trim();
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    if (!trimmed) {
      setLoading(false);
      setIsError(false);
      setSongs([]);
      setAlbums([]);
      setArtists([]);
      setMatchedPlaylists([]);
      return;
    }

    setLoading(true);
    setIsError(false);

    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const lower = trimmed.toLowerCase();
        const playlistResults = allPlaylists.filter((p) => p.name.toLowerCase().includes(lower));

        if (tab === "all") {
          const res = await searchItunesAll(trimmed, controller.signal);
          if (!controller.signal.aborted) {
            setSongs(res.songs);
            setAlbums(res.albums);
            setArtists(res.artists);
            setMatchedPlaylists(playlistResults);
            setLoading(false);
          }
        } else if (tab === "songs") {
          const res = await searchItunesSongs(trimmed, controller.signal);
          if (!controller.signal.aborted) {
            setSongs(res);
            setAlbums([]);
            setArtists([]);
            setMatchedPlaylists([]);
            setLoading(false);
          }
        } else if (tab === "albums") {
          const res = await searchItunesAlbums(trimmed, controller.signal);
          if (!controller.signal.aborted) {
            setSongs([]);
            setAlbums(res);
            setArtists([]);
            setMatchedPlaylists([]);
            setLoading(false);
          }
        } else if (tab === "artists") {
          const res = await searchItunesArtists(trimmed, controller.signal);
          if (!controller.signal.aborted) {
            setSongs([]);
            setAlbums([]);
            setArtists(res);
            setMatchedPlaylists([]);
            setLoading(false);
          }
        } else if (tab === "playlists") {
          if (!controller.signal.aborted) {
            setSongs([]);
            setAlbums([]);
            setArtists([]);
            setMatchedPlaylists(playlistResults);
            setLoading(false);
          }
        }
      } catch {
        if (controller.signal.aborted) return;
        // Offline / error fallback to bundled songs, albums, and artists
        const lower = trimmed.toLowerCase();
        setSongs(fallbackSearchSongs(trimmed));
        setAlbums(fallbackSearchAlbums(trimmed));
        setArtists(fallbackSearchArtists(trimmed));
        setMatchedPlaylists(allPlaylists.filter((p) => p.name.toLowerCase().includes(lower)));
        setIsError(false);
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, tab, allPlaylists]);

  const hasAnyResults =
    songs.length > 0 || albums.length > 0 || artists.length > 0 || matchedPlaylists.length > 0;

  const handleSelectRecent = (term: string) => {
    setQ(term);
  };

  return (
    <main className="scroll-pane flex-1 overflow-y-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Search</h1>

      <div className="mt-4 flex items-center gap-2 rounded-full bg-white/10 px-4 py-3 sm:px-5">
        <SearchIcon className="h-4 w-4 shrink-0 text-white/60" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What do you want to listen to?"
          aria-label="Search catalog"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-red-500"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            aria-label="Clear query"
            className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const active = tab === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setTab(cat.id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-150",
                active
                  ? "bg-white text-black"
                  : "bg-white/10 text-white/80 hover:bg-white/15 hover:text-white",
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {!q.trim() ? (
        <div className="mt-8">
          {recent.length > 0 ? (
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-wide text-white/70">
                  Recent searches
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    clearRecentSearches();
                    setRecent([]);
                  }}
                  className="text-xs text-white/40 transition-colors hover:text-white/80"
                >
                  Clear all
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {recent.map((term) => (
                  <div
                    key={term}
                    className="group inline-flex items-center gap-1.5 rounded-full bg-white/5 py-1 pr-1.5 pl-3 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectRecent(term)}
                      className="inline-flex items-center gap-2"
                    >
                      <Clock className="h-3.5 w-3.5 text-white/40" />
                      <span>{term}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${term}`}
                      onClick={() => {
                        const next = removeRecentSearch(term);
                        setRecent(next);
                      }}
                      className="rounded-full p-0.5 text-white/40 hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-12 text-center text-sm text-white/40">
              Search for songs, artists, albums, or playlists.
            </div>
          )}
        </div>
      ) : loading ? (
        <div className="mt-8 space-y-3" aria-busy="true">
          <Skeleton className="h-12 w-full rounded" />
          <Skeleton className="h-12 w-full rounded" />
          <Skeleton className="h-12 w-full rounded" />
          <Skeleton className="h-12 w-full rounded" />
        </div>
      ) : isError ? (
        <div className="mt-8">
          <EmptyState
            title="Search error"
            description="We couldn't reach the search service. Try again in a moment."
          />
        </div>
      ) : !hasAnyResults ? (
        <div className="mt-8">
          <EmptyState
            title="No results found"
            description={`Couldn't find anything matching "${q}".`}
            action={
              <button
                type="button"
                onClick={() => setQ("")}
                className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-white transition-colors hover:bg-white/20 active:scale-95"
              >
                Clear search
              </button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {(tab === "all" || tab === "songs") && songs.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">Songs</h2>
              <div className="space-y-1">
                {songs.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handlePlaySong(s, songs)}
                    className="song-row flex w-full items-center gap-3 rounded px-3 py-2 text-left transition-colors duration-150 ease-out hover:bg-white/5"
                  >
                    <div
                      className="relative h-10 w-10 shrink-0 overflow-hidden rounded"
                      style={{ background: s.color }}
                    >
                      {s.artwork ? (
                        <Image
                          src={s.artwork}
                          alt={s.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <Music className="m-auto h-4 w-4 text-white/30" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.title}</p>
                      <p className="truncate text-xs text-white/60">{s.artist}</p>
                    </div>
                    <span className="text-xs text-white/50 tabular-nums">
                      {Math.floor(s.duration / 60)}:{String(s.duration % 60).padStart(2, "0")}
                    </span>
                    <Play className="h-4 w-4 text-white/40" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {(tab === "all" || tab === "albums") && albums.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">Albums</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {albums.map((a) => (
                  <Link
                    key={a.id}
                    href={`/album/${a.id}`}
                    className="group rounded-2xl bg-[var(--bg-card)] p-3 text-left transition-colors duration-150 hover:bg-[var(--bg-elev)]"
                  >
                    <div
                      className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg"
                      style={{ background: a.color }}
                    >
                      {a.artwork ? (
                        <Image
                          src={a.artwork}
                          alt={a.title}
                          fill
                          sizes="180px"
                          className="object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      ) : (
                        <Disc3 className="m-auto h-8 w-8 text-white/30" />
                      )}
                    </div>
                    <p className="truncate text-sm font-semibold">{a.title}</p>
                    <p className="truncate text-xs text-white/60">
                      {a.artist}
                      {a.year ? ` · ${a.year}` : ""}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(tab === "all" || tab === "artists") && artists.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">Artists</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {artists.map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/artist/${artist.id}`}
                    className="group rounded-2xl bg-[var(--bg-card)] p-4 text-center transition-colors duration-150 hover:bg-[var(--bg-elev)]"
                  >
                    <div className="relative mx-auto mb-3 aspect-square w-24 overflow-hidden rounded-full bg-white/10 sm:w-28">
                      {artist.artwork ? (
                        <Image
                          src={artist.artwork}
                          alt={artist.name}
                          fill
                          sizes="112px"
                          className="object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      ) : (
                        <Mic2 className="m-auto h-8 w-8 text-white/40" />
                      )}
                    </div>
                    <p className="truncate text-sm font-semibold">{artist.name}</p>
                    <p className="truncate text-xs text-white/60">{artist.genre ?? "Artist"}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(tab === "all" || tab === "playlists") && matchedPlaylists.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">Playlists</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {matchedPlaylists.map((p) => (
                  <Link
                    key={p.id}
                    href={`/playlist/${p.id}`}
                    className="group rounded-2xl bg-[var(--bg-card)] p-3 text-left transition-colors duration-150 hover:bg-[var(--bg-elev)]"
                  >
                    <div
                      className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg"
                      style={{ background: p.cover }}
                    />
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="truncate text-xs text-white/60">
                      {p.songIds.length} songs{p.system ? " · sunao" : ""}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
