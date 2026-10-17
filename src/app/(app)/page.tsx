"use client";

import { Disc3, Music, Play, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { greetingForHour } from "@/lib/greeting";
import type { Album, Song } from "@/lib/queries";
import { useAlbums, useSongs } from "@/lib/queries";
import { useRecentlyPlayed } from "@/lib/recently-played";
import { usePlayer } from "@/stores/player";

export default function Home() {
  const play = usePlayer((s) => s.play);
  const setQueue = usePlayer((s) => s.setQueue);
  const registerSongs = usePlayer((s) => s.registerSongs);
  const { data: songs = [], isError: songsError } = useSongs();
  const { data: albums = [], isError: albumsError } = useAlbums();
  const recentlyPlayed = useRecentlyPlayed();

  const songById = useMemo(() => new Map(songs.map((song) => [song.id, song])), [songs]);

  const playAlbum = (album: Album, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const list = album.songs
      .map((id) => songById.get(id))
      .filter((song): song is Song => Boolean(song));
    if (list.length === 0) return;
    registerSongs(list);
    setQueue(list.map((song) => song.id));
    play(list[0]);
  };

  const handlePlaySong = (song: Song, queueList: Song[]) => {
    registerSongs(queueList);
    setQueue(queueList.map((s) => s.id));
    play(song);
  };

  // Compute "Made For You" recommendations based on play history / favorite artists
  const recommendations = useMemo(() => {
    if (songs.length === 0) return [];

    const playedIds = new Set(recentlyPlayed.map((s) => s.id));
    const favoriteArtists = new Set(recentlyPlayed.map((s) => s.artist.toLowerCase()));

    // Prefer unplayed songs from favorite artists
    const artistMatches = songs.filter(
      (s) => favoriteArtists.has(s.artist.toLowerCase()) && !playedIds.has(s.id),
    );

    // Then other unplayed songs
    const unplayedOthers = songs.filter(
      (s) => !favoriteArtists.has(s.artist.toLowerCase()) && !playedIds.has(s.id),
    );

    const pool = [...artistMatches, ...unplayedOthers];
    if (pool.length >= 4) {
      return pool.slice(0, 6);
    }

    // If library is small or all have been played, return a curated slice of library
    return songs.slice(0, 6);
  }, [songs, recentlyPlayed]);

  if (albumsError || songsError) {
    return (
      <main className="scroll-pane flex-1 overflow-y-auto p-4 sm:p-6">
        <h1 className="text-2xl font-bold" suppressHydrationWarning>
          {greetingForHour(new Date().getHours())}
        </h1>
        <EmptyState
          title="Couldn't load your library"
          description="Check your connection and try again."
        />
      </main>
    );
  }

  return (
    <main className="scroll-pane flex-1 overflow-y-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold" suppressHydrationWarning>
        {greetingForHour(new Date().getHours())}
      </h1>

      {albums.length === 0 && songs.length === 0 ? (
        <EmptyState title="Nothing here yet" description="Add songs to get started." />
      ) : (
        <>
          {/* Recently Played Section */}
          {recentlyPlayed.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">Recently Played</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {recentlyPlayed.slice(0, 6).map((s) => (
                  <button
                    key={`recent-${s.id}`}
                    type="button"
                    onClick={() => handlePlaySong(s, recentlyPlayed)}
                    className="group rounded-2xl bg-[var(--bg-card)] p-3 text-left transition-colors duration-150 hover:bg-[var(--bg-elev)]"
                  >
                    <div
                      className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg"
                      style={{ background: s.color }}
                    >
                      {s.artwork ? (
                        <Image
                          src={s.artwork}
                          alt={s.title}
                          fill
                          sizes="160px"
                          className="object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      ) : (
                        <Music className="m-auto h-8 w-8 text-white/30" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                          <Play className="h-5 w-5 fill-white" />
                        </div>
                      </div>
                    </div>
                    <p className="truncate text-sm font-semibold">{s.title}</p>
                    <p className="truncate text-xs text-white/60">{s.artist}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Made For You Section */}
          {recommendations.length > 0 && (
            <section className="mt-8">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-red-500" />
                <h2 className="text-lg font-semibold">Made For You</h2>
              </div>
              <p className="mt-0.5 text-xs text-white/50">
                Picks based on your listening habits and favorite genres
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {recommendations.map((s) => (
                  <button
                    key={`rec-${s.id}`}
                    type="button"
                    onClick={() => handlePlaySong(s, recommendations)}
                    className="group rounded-2xl bg-[var(--bg-card)] p-3 text-left transition-colors duration-150 hover:bg-[var(--bg-elev)]"
                  >
                    <div
                      className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg"
                      style={{ background: s.color }}
                    >
                      {s.artwork ? (
                        <Image
                          src={s.artwork}
                          alt={s.title}
                          fill
                          sizes="160px"
                          className="object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      ) : (
                        <Music className="m-auto h-8 w-8 text-white/30" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                          <Play className="h-5 w-5 fill-white" />
                        </div>
                      </div>
                    </div>
                    <p className="truncate text-sm font-semibold">{s.title}</p>
                    <p className="truncate text-xs text-white/60">{s.artist}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Featured Albums Section */}
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Albums</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {albums.map((a, i) => (
                <Link
                  key={a.id}
                  href={`/album/${a.id}`}
                  className="group relative motion-safe:animate-[sunao-fade-in_200ms_var(--ease-out)_both] rounded-3xl bg-[var(--bg-card)] p-4 text-left transition-colors duration-150 ease-out hover:bg-[var(--bg-elev)]"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div
                    className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg"
                    style={{ background: a.color }}
                  >
                    {a.artwork ? (
                      <Image
                        src={a.artwork}
                        alt={a.title}
                        fill
                        sizes="200px"
                        priority={i === 0}
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <Disc3 className="m-auto h-12 w-12 text-white/30" />
                    )}
                    <button
                      type="button"
                      aria-label={`Play ${a.title}`}
                      onClick={(e) => playAlbum(a, e)}
                      className="absolute right-2 bottom-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white opacity-0 shadow-xl transition-all duration-150 group-hover:opacity-100 hover:scale-105"
                    >
                      <Play className="h-5 w-5 fill-white" />
                    </button>
                  </div>
                  <p className="truncate text-sm font-semibold">{a.title}</p>
                  <p className="truncate text-xs text-white/60">{a.artist}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Library Songs Section */}
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Songs</h2>
            <div className="mt-3 space-y-1">
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
                    ) : null}
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
        </>
      )}
    </main>
  );
}
