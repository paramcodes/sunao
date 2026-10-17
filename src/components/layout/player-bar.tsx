"use client";

import { Heart, Maximize2, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { usePlayer } from "@/stores/player";

export function PlayerBar() {
  const { isPlaying, togglePlay, speed, setSpeed } = usePlayer();

  return (
    <div className="flex items-center gap-3 border-t border-white/5 bg-[#181818] px-4 py-4">
      <button className="btn-ghost flex items-center gap-3 rounded-lg px-2 py-1.5">
        <div className="h-14 w-14 shrink-0 rounded-lg bg-red-900" />
        <div className="w-44 text-left">
          <p className="truncate text-sm font-semibold">Crimson Tide</p>
          <p className="truncate text-xs text-white/60">The Hollows</p>
        </div>
      </button>

      <div className="flex items-center gap-1">
        <button className="btn-ghost flex h-9 w-9 items-center justify-center rounded-full">
          <SkipBack className="h-[18px] w-[18px]" />
        </button>
        <button
          onClick={togglePlay}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
        </button>
        <button className="btn-ghost flex h-9 w-9 items-center justify-center rounded-full">
          <SkipForward className="h-[18px] w-[18px]" />
        </button>
      </div>

      <div className="flex max-w-[620px] flex-1 items-center gap-3">
        <span className="w-9 text-right text-xs tabular-nums text-white/70">0:42</span>
        <input
          type="range"
          min={0}
          max={100}
          defaultValue={20}
          className="h-1 flex-1 cursor-pointer appearance-none rounded bg-white/20 accent-white"
        />
        <span className="w-9 text-xs tabular-nums text-white/50">3:34</span>
        <button className="btn-ghost flex h-8 w-8 items-center justify-center rounded-full">
          <Heart className="h-[18px] w-[18px]" />
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
      <button className="btn-ghost flex h-9 w-9 items-center justify-center rounded-full">
        <Maximize2 className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}
