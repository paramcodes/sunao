"use client";

import { Play } from "lucide-react";
import { PlayerBar } from "@/components/layout/player-bar";
import { QueuePanel } from "@/components/layout/queue-panel";
import { Sidebar } from "@/components/layout/sidebar";
import { useAlbums, useSongs } from "@/lib/queries";
import { usePlayer } from "@/stores/player";

export default function Home() {
  const play = usePlayer((s) => s.play);
  const { data: songs = [] } = useSongs();
  const { data: albums = [] } = useAlbums();

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold">Good evening</h1>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {albums.map((a) => (
              <div key={a.id} className="rounded-3xl bg-[#181818] p-4 hover:bg-[#282828]">
                <div
                  className="mb-3 aspect-square w-full rounded-lg"
                  style={{ background: a.color }}
                />
                <p className="truncate text-sm font-semibold">{a.title}</p>
                <p className="truncate text-xs text-white/60">{a.artist}</p>
              </div>
            ))}
          </div>
          <h2 className="mt-8 text-xl font-bold">Songs</h2>
          <div className="mt-3 space-y-1">
            {songs.map((s, i) => (
              <button
                key={s.id}
                onClick={() => play(s)}
                className="flex w-full items-center gap-3 rounded px-3 py-2 text-left hover:bg-white/5"
              >
                <span className="w-6 text-right text-sm tabular-nums text-white/40">{i + 1}</span>
                <div className="h-10 w-10 shrink-0 rounded" style={{ background: s.color }} />
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
        <QueuePanel />
      </div>
      <PlayerBar />
    </div>
  );
}
