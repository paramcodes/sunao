"use client";

import { Heart, Maximize2, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { SONGS } from "@/lib/data/songs";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/stores/player";

export function PlayerBar() {
  const currentSongId = usePlayer((s) => s.currentSongId);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const position = usePlayer((s) => s.position);
  const speed = usePlayer((s) => s.speed);
  const liked = usePlayer((s) => s.liked);
  const play = usePlayer((s) => s.play);
  const togglePlay = usePlayer((s) => s.togglePlay);
  const seek = usePlayer((s) => s.seek);
  const setSpeed = usePlayer((s) => s.setSpeed);
  const next = usePlayer((s) => s.next);
  const prev = usePlayer((s) => s.prev);
  const toggleLike = usePlayer((s) => s.toggleLike);

  const song = SONGS.find((s) => s.id === currentSongId) ?? SONGS[0];
  const isLiked = liked.has(song.id);

  const fmt = (sec: number) => {
    const s = Math.max(0, Math.floor(sec));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3 border-t border-white/5 bg-[#181818] px-4 py-4">
      <button
        onClick={() => play(song)}
        className="btn-ghost flex items-center gap-3 rounded-lg px-2 py-1.5"
      >
        <div className="h-14 w-14 shrink-0 rounded-lg" style={{ background: song.color }} />
        <div className="w-44 text-left">
          <p className="truncate text-sm font-semibold">{song.title}</p>
          <p className="truncate text-xs text-white/60">{song.artist}</p>
        </div>
      </button>

      <div className="flex items-center gap-1">
        <button
          onClick={prev}
          aria-label="Previous track"
          className="btn-ghost flex h-9 w-9 items-center justify-center rounded-full"
        >
          <SkipBack className="h-[18px] w-[18px]" />
        </button>
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
        </button>
        <button
          onClick={next}
          aria-label="Next track"
          className="btn-ghost flex h-9 w-9 items-center justify-center rounded-full"
        >
          <SkipForward className="h-[18px] w-[18px]" />
        </button>
      </div>

      <div className="flex max-w-[620px] flex-1 items-center gap-3">
        <span className="w-9 text-right text-xs tabular-nums text-white/70">{fmt(position)}</span>
        <input
          type="range"
          min={0}
          max={song.duration}
          step={0.1}
          value={position}
          onChange={(e) => seek(Number(e.target.value))}
          className="h-1 flex-1 cursor-pointer appearance-none rounded bg-white/20 accent-white"
        />
        <span className="w-9 text-xs tabular-nums text-white/50">{fmt(song.duration)}</span>
        <button
          onClick={() => toggleLike(song.id)}
          aria-label={isLiked ? "Unlike" : "Like"}
          className={cn(
            "btn-ghost flex h-8 w-8 items-center justify-center rounded-full",
            isLiked && "text-red-500",
          )}
        >
          <Heart className={cn("h-[18px] w-[18px]", isLiked && "fill-current")} />
        </button>
      </div>

      <div className="relative ml-auto group">
        <button className="btn-ghost rounded-lg px-3 py-1.5 text-sm font-semibold">{speed}×</button>
        <div className="absolute bottom-full right-0 mb-2 hidden flex-col gap-1 rounded-lg border border-white/10 bg-[#1f1f1f] p-2 shadow-2xl group-hover:flex">
          {[0.5, 1, 1.25, 1.5, 2].map((v) => (
            <button
              key={v}
              onClick={() => setSpeed(v)}
              className="rounded px-2 py-1 text-left text-sm hover:bg-white/10"
            >
              {v}×
            </button>
          ))}
        </div>
      </div>
      <button
        aria-label="Full screen"
        className="btn-ghost flex h-9 w-9 items-center justify-center rounded-full"
      >
        <Maximize2 className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}
