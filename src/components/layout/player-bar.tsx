"use client";

import {
  Heart,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Kbd } from "@/components/ui/kbd";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SONGS } from "@/lib/data/songs";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/stores/player";

const formatTime = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

function MobileProgress() {
  const position = usePlayer((s) => s.position);
  const duration = usePlayer((s) => s.duration);
  const pct = duration ? Math.min(100, (position / duration) * 100) : 0;
  return (
    <div className="absolute inset-x-0 top-0 h-0.5 bg-white/10 md:hidden">
      <div className="h-full bg-white" style={{ width: `${pct}%` }} />
    </div>
  );
}

function SeekBar({ fallbackDuration }: { fallbackDuration: number }) {
  const position = usePlayer((s) => s.position);
  const duration = usePlayer((s) => s.duration);
  const seek = usePlayer((s) => s.seek);
  const [scrub, setScrub] = useState<number | null>(null);

  const max = duration ?? fallbackDuration;
  const shown = scrub ?? position;

  return (
    <>
      <span className="w-9 text-right text-xs tabular-nums text-white/70">{formatTime(shown)}</span>
      <Slider
        className="flex-1"
        min={0}
        max={max}
        step={0.1}
        value={[shown]}
        getAriaLabel={() => "Seek"}
        onValueChange={(value) => setScrub(Array.isArray(value) ? value[0] : value)}
        onValueCommitted={(value) => {
          seek(Array.isArray(value) ? value[0] : value);
          setScrub(null);
        }}
      />
      <span className="w-9 text-xs tabular-nums text-white/50">{formatTime(max)}</span>
    </>
  );
}

function LikeButton({ songId }: { songId: number }) {
  const liked = usePlayer((s) => s.liked);
  const toggleLike = usePlayer((s) => s.toggleLike);
  const isLiked = liked.has(songId);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            onClick={() => {
              toggleLike(songId);
              if (isLiked) {
                toast("Removed from Liked Songs", {
                  action: { label: "Undo", onClick: () => toggleLike(songId) },
                });
              } else {
                toast.success("Saved to Liked Songs");
              }
            }}
            aria-label={isLiked ? "Unlike" : "Like"}
            aria-pressed={isLiked}
            className={cn(
              "btn-ghost flex h-8 w-8 items-center justify-center rounded-full",
              isLiked && "text-red-500",
            )}
          />
        }
      >
        <Heart className={cn("h-[18px] w-[18px]", isLiked && "fill-current")} />
      </TooltipTrigger>
      <TooltipContent>{isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}</TooltipContent>
    </Tooltip>
  );
}

function SpeedControl() {
  const speed = usePlayer((s) => s.speed);
  const setSpeed = usePlayer((s) => s.setSpeed);

  return (
    <div className="group relative hidden md:block">
      <button className="btn-ghost rounded-lg px-3 py-1.5 text-sm font-semibold">{speed}×</button>
      <div className="invisible absolute right-0 bottom-full mb-2 flex origin-bottom-right translate-y-1 scale-95 flex-col gap-1 rounded-lg border border-white/10 bg-[#1f1f1f] p-2 opacity-0 shadow-2xl transition-[opacity,transform,visibility] duration-150 ease-out group-hover:visible group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:opacity-100">
        {[0.5, 1, 1.25, 1.5, 2].map((v) => (
          <button
            key={v}
            onClick={() => setSpeed(v)}
            className="rounded px-2 py-1 text-left text-sm transition-colors duration-100 ease-out hover:bg-white/10 active:scale-[0.97]"
          >
            {v}×
          </button>
        ))}
      </div>
    </div>
  );
}

function FullScreenButton() {
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    onChange();
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
      return;
    }
    void document.documentElement.requestFullscreen().catch(() => {
      toast.error("Full screen isn't available in this browser");
    });
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            onClick={toggle}
            aria-label={isFull ? "Exit full screen" : "Full screen"}
            aria-pressed={isFull}
            className="btn-ghost hidden h-9 w-9 items-center justify-center rounded-full md:flex"
          />
        }
      >
        {isFull ? (
          <Minimize2 className="h-[18px] w-[18px]" />
        ) : (
          <Maximize2 className="h-[18px] w-[18px]" />
        )}
      </TooltipTrigger>
      <TooltipContent>{isFull ? "Exit full screen" : "Full screen"}</TooltipContent>
    </Tooltip>
  );
}

export function PlayerBar() {
  const currentSongId = usePlayer((s) => s.currentSongId);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const isBuffering = usePlayer((s) => s.isBuffering);
  const play = usePlayer((s) => s.play);
  const togglePlay = usePlayer((s) => s.togglePlay);
  const next = usePlayer((s) => s.next);
  const prev = usePlayer((s) => s.prev);

  const song = SONGS.find((s) => s.id === currentSongId) ?? SONGS[0];

  return (
    <div
      data-slot="player-bar"
      className="relative flex items-center gap-2 border-t border-white/5 bg-[#181818] px-3 py-3 sm:gap-3 sm:px-4 sm:py-4"
    >
      <MobileProgress />

      <button
        onClick={() => play(song)}
        className="btn-ghost flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1.5 sm:flex-none"
      >
        <div
          className="h-12 w-12 shrink-0 rounded-lg sm:h-14 sm:w-14"
          style={{ background: song.color }}
        />
        <div className="min-w-0 text-left sm:w-44">
          <p className="truncate text-sm font-semibold">{song.title}</p>
          <p className="truncate text-xs text-white/60">{song.artist}</p>
        </div>
      </button>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                onClick={prev}
                aria-label="Previous track"
                className="btn-ghost flex h-9 w-9 items-center justify-center rounded-full"
              />
            }
          >
            <SkipBack className="h-[18px] w-[18px]" />
          </TooltipTrigger>
          <TooltipContent>Previous</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white transition-[background-color,transform] duration-150 ease-out hover:bg-red-700 active:scale-95"
              />
            }
          >
            {isBuffering && isPlaying ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 translate-x-0.5" />
            )}
          </TooltipTrigger>
          <TooltipContent>
            {isPlaying ? "Pause" : "Play"} <Kbd>Space</Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                onClick={next}
                aria-label="Next track"
                className="btn-ghost flex h-9 w-9 items-center justify-center rounded-full"
              />
            }
          >
            <SkipForward className="h-[18px] w-[18px]" />
          </TooltipTrigger>
          <TooltipContent>Next</TooltipContent>
        </Tooltip>
      </div>

      <div className="hidden min-w-0 max-w-[620px] flex-1 items-center gap-3 md:flex">
        <SeekBar fallbackDuration={song.duration} />
      </div>

      <div className="ml-auto flex items-center gap-1 md:ml-0">
        <LikeButton songId={song.id} />
      </div>

      <SpeedControl />
      <FullScreenButton />
    </div>
  );
}
