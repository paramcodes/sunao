"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { greetingForHour } from "@/lib/greeting";
import type { Album, Song } from "@/lib/queries";
import { useAlbums, useSongs } from "@/lib/queries";
import { usePlayer } from "@/stores/player";

export default function Home() {
  const play = usePlayer((s) => s.play);
  const setQueue = usePlayer((s) => s.setQueue);
  const { data: songs = [], isError: songsError } = useSongs();
  const { data: albums = [], isError: albumsError } = useAlbums();

  const songById = useMemo(() => new Map(songs.map((song) => [song.id, song])), [songs]);

  const playAlbum = (album: Album) => {
    const list = album.songs
      .map((id) => songById.get(id))
      .filter((song): song is Song => Boolean(song));
    if (list.length === 0) return;
    setQueue(list.map((song) => song.id));
    play(list[0]);
  };

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
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {albums.map((a, i) => (
              <button
                key={a.id}
                type="button"
                onClick={() => playAlbum(a)}
                className="motion-safe:animate-[sunao-fade-in_200ms_var(--ease-out)_both] rounded-3xl bg-[var(--bg-card)] p-4 text-left transition-colors duration-150 ease-out hover:bg-[var(--bg-elev)]"
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
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <p className="truncate text-sm font-semibold">{a.title}</p>
                <p className="truncate text-xs text-white/60">{a.artist}</p>
              </button>
            ))}
          </div>
          <h2 className="mt-8 text-lg font-semibold">Songs</h2>
          <div className="mt-3 space-y-1">
            {songs.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setQueue(songs.map((song) => song.id));
                  play(s);
                }}
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
        </>
      )}
    </main>
  );
}
