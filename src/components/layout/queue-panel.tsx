"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { Music, PanelRightClose, PanelRightOpen } from "lucide-react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSongs } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/stores/player";

const PANEL_ID = "queue-panel-content";

export function QueueContent() {
  const queue = usePlayer((s) => s.queue);
  const currentSongId = usePlayer((s) => s.currentSongId);
  const play = usePlayer((s) => s.play);
  const { data: songs = [] } = useSongs();

  const songById = useMemo(() => new Map(songs.map((song) => [song.id, song])), [songs]);
  const current = songById.get(currentSongId ?? -1) ?? null;

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: queue.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 6,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h3 className="mb-3 text-xs font-semibold text-white/60">Now playing</h3>
      {current ? (
        <button
          onClick={() => play(current)}
          className="mb-5 flex items-center gap-3 rounded-lg bg-white/5 p-3 text-left transition-colors duration-150 ease-out hover:bg-white/10"
        >
          <div
            className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md"
            style={{ background: current.color ?? "#282828" }}
          >
            {current.artwork ? (
              <Image
                src={current.artwork}
                alt={current.title}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{current.title}</p>
            <p className="truncate text-xs text-white/50">{current.artist}</p>
          </div>
        </button>
      ) : (
        <div className="mb-5 flex items-center gap-3 rounded-lg bg-white/5 p-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white/5">
            <Music className="h-5 w-5 text-white/30" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white/60">Nothing playing</p>
            <p className="truncate text-xs text-white/40">Choose a song to start</p>
          </div>
        </div>
      )}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white/60">Queue</h3>
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
            const s = songById.get(id);
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
                  {s.artwork ? (
                    <Image
                      src={s.artwork}
                      alt={s.title}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  ) : null}
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
  const [open, setOpen] = useState(true);
  const label = open ? "Hide queue" : "Show queue";

  return (
    <aside
      data-slot="queue-panel"
      className={cn(
        "hidden h-full shrink-0 flex-col overflow-hidden border-l border-white/5 bg-[var(--bg-card)] transition-[width,padding] duration-[var(--duration-drawer)] ease-[var(--ease-drawer)] lg:flex",
        open ? "w-72 p-4" : "w-10 px-1 py-4",
      )}
    >
      <div className="flex h-9 shrink-0 items-center">
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                onClick={() => setOpen((v) => !v)}
                aria-label={label}
                aria-expanded={open}
                aria-controls={PANEL_ID}
                className="btn-ghost flex h-7 w-7 items-center justify-center rounded-md"
              />
            }
          >
            {open ? (
              <PanelRightClose className="h-[18px] w-[18px]" />
            ) : (
              <PanelRightOpen className="h-[18px] w-[18px]" />
            )}
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      </div>
      <div
        id={PANEL_ID}
        inert={!open}
        className={cn(
          "flex min-h-0 flex-1 flex-col transition-opacity duration-[var(--duration-drawer)] ease-[var(--ease-drawer)]",
          open ? "opacity-100" : "opacity-0",
        )}
      >
        <QueueContent />
      </div>
    </aside>
  );
}
