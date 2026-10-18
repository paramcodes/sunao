"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import type { Album, Song } from "@/lib/queries";
import { useAlbums, useSongs } from "@/lib/queries";
import { usePlayer } from "@/stores/player";

export default function Home() {
  const play = usePlayer((s) => s.play);
  const setQueue = usePlayer((s) => s.setQueue);
  const { data: songs = [] } = useSongs();
  const { data: albums = [] } = useAlbums();

  const playAlbum = (album: Album) => {
    const list = album.songs
      .map((id) => songs.find((song) => song.id === id))
      .filter((song): song is Song => Boolean(song));
    if (list.length === 0) return;
    setQueue(list.map((song) => song.id));
    play(list[0]);
  };

  return (
    <main className="scroll-pane flex-1 overflow-y-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Good evening</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {albums.map((a, i) => (
          <button
            key={a.id}
            type="button"
            onClick={() => playAlbum(a)}
            className="motion-safe:animate-[sunao-fade-in_200ms_var(--ease-out)_both] rounded-3xl bg-[#181818] p-4 text-left transition-colors duration-150 ease-out hover:bg-[#282828]"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div
              className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg"
              style={{ background: a.color }}
            >
              {a.artwork && (
                <Image src={a.artwork} alt="" fill sizes="200px" className="object-cover" />
              )}
            </div>
            <p className="truncate text-sm font-semibold">{a.title}</p>
            <p className="truncate text-xs text-white/60">{a.artist}</p>
          </button>
        ))}
      </div>
      <h2 className="mt-8 text-xl font-bold">Songs</h2>
      <div className="mt-3 space-y-1">
        {songs.map((s, i) => (
          <button
            key={s.id}
            onClick={() => play(s)}
            className="flex w-full items-center gap-3 rounded px-3 py-2 text-left transition-colors duration-150 ease-out hover:bg-white/5"
          >
            <span className="w-6 text-right text-sm tabular-nums text-white/40">{i + 1}</span>
            <div
              className="relative h-10 w-10 shrink-0 overflow-hidden rounded"
              style={{ background: s.color }}
            >
              {s.artwork && (
                <Image src={s.artwork} alt="" fill sizes="40px" className="object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{s.title}</p>
              <p className="truncate text-xs text-white/50">{s.artist}</p>
            </div>
            <span className="text-xs text-white/50 tabular-nums">
              {Math.floor(s.duration / 60)}:{String(s.duration % 60).padStart(2, "0")}
            </span>
            <Play className="h-4 w-4 text-white/40" />
          </button>
        ))}
      </div>
    </main>
  );
}
