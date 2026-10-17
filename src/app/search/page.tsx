"use client";

import { Play, Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { PlayerBar } from "@/components/layout/player-bar";
import { QueuePanel } from "@/components/layout/queue-panel";
import { Sidebar } from "@/components/layout/sidebar";
import { useSongs } from "@/lib/queries";
import { usePlayer } from "@/stores/player";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const play = usePlayer((s) => s.play);
  const { data: songs = [] } = useSongs();

  const results = q
    ? songs.filter(
        (s) =>
          s.title.toLowerCase().includes(q.toLowerCase()) ||
          s.artist.toLowerCase().includes(q.toLowerCase()),
      )
    : songs;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold">Search</h1>
          <div className="mt-4 flex items-center gap-2 rounded-full bg-white/10 px-5 py-3">
            <SearchIcon className="h-4 w-4 text-white/60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="What do you want to listen to?"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
            />
          </div>
          <div className="mt-6 space-y-1">
            {results.map((s, i) => (
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
