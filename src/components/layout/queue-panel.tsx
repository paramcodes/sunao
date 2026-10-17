"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import Image from "next/image";
import { useRef } from "react";
import { SONGS } from "@/lib/data/songs";
import { usePlayer } from "@/stores/player";

export function QueueContent() {
  const queue = usePlayer((s) => s.queue);
  const currentSongId = usePlayer((s) => s.currentSongId);
  const play = usePlayer((s) => s.play);

  const current = SONGS.find((s) => s.id === currentSongId) ?? SONGS[0];

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: queue.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 6,
  });

  if (!current) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/60">Now playing</h3>
      <button
        onClick={() => play(current)}
        className="mb-5 flex items-center gap-3 rounded-lg bg-white/5 p-3 text-left transition-colors duration-150 ease-out hover:bg-white/10"
      >
        <div
          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md"
          style={{ background: current.color ?? "#282828" }}
        >
          {current.artwork && (
            <Image src={current.artwork} alt="" fill sizes="48px" className="object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{current.title}</p>
          <p className="truncate text-xs text-white/50">{current.artist}</p>
        </div>
      </button>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">Queue</h3>
        <span className="text-xs text-white/40">
          {queue.length} {queue.length === 1 ? "song" : "songs"}
        </span>
      </div>
      <div ref={parentRef} className="scroll-pane min-h-0 flex-1 overflow-y-auto">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const id = queue[virtualRow.index];
            const s = SONGS.find((x) => x.id === id);
            if (!s) return null;
            return (
              <button
                key={id}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                onClick={() => play(s)}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors duration-150 ease-out hover:bg-white/5 ${
                  id === currentSongId ? "bg-red-600/15" : ""
                }`}
              >
                <span className="w-5 text-right text-xs tabular-nums text-white/40">
                  {virtualRow.index + 1}
                </span>
                <div
                  className="relative h-8 w-8 shrink-0 overflow-hidden rounded"
                  style={{ background: s.color ?? "#282828" }}
                >
                  {s.artwork && (
                    <Image src={s.artwork} alt="" fill sizes="32px" className="object-cover" />
                  )}
                </div>
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
      </div>
    </div>
  );
}

export function QueuePanel() {
  return (
    <aside
      data-slot="queue-panel"
      className="hidden w-72 shrink-0 flex-col border-l border-white/5 bg-[#181818] p-4 lg:flex"
    >
      <QueueContent />
    </aside>
  );
}
