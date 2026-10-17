"use client";

import { SONGS } from "@/lib/data/songs";
import { usePlayer } from "@/stores/player";

export function QueuePanel() {
  const queue = usePlayer((s) => s.queue);
  const currentSongId = usePlayer((s) => s.currentSongId);
  const play = usePlayer((s) => s.play);

  const current = SONGS.find((s) => s.id === currentSongId) ?? SONGS[0];

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-l border-white/5 bg-[#181818] p-4 lg:flex">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/60">Now playing</h3>
      <button
        onClick={() => play(current)}
        className="mb-5 flex items-center gap-3 rounded-lg bg-white/5 p-3 text-left hover:bg-white/10"
      >
        <div className="h-12 w-12 shrink-0 rounded-md" style={{ background: current.color }} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{current.title}</p>
          <p className="truncate text-xs text-white/50">{current.artist}</p>
        </div>
      </button>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">Queue</h3>
        <span className="text-xs text-white/40">{queue.length} songs</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {queue.map((id, i) => {
          const s = SONGS.find((x) => x.id === id);
          if (!s) return null;
          return (
            <button
              key={id}
              onClick={() => play(s)}
              className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-white/5 ${
                id === currentSongId ? "bg-red-600/15" : ""
              }`}
            >
              <span className="w-5 text-right text-xs tabular-nums text-white/40">{i + 1}</span>
              <div className="h-8 w-8 shrink-0 rounded" style={{ background: s.color }} />
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm ${
                    id === currentSongId ? "font-semibold text-red-400" : ""
                  }`}
                >
                  {s.title}
                </p>
                <p className="truncate text-xs text-white/50">{s.artist}</p>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
