"use client";

import {
  Heart,
  Loader2,
  Maximize2,
  Minimize2,
  Music,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Kbd } from "@/components/ui/kbd";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDelayedFlag } from "@/hooks/use-delayed-flag";
import { useIsLiked, useSetLiked, useSongs } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/stores/player";

export const formatTime = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

function MobileSeek() {
  const position = usePlayer((s) => s.position);
  const duration = usePlayer((s) => s.duration);
  const seek = usePlayer((s) => s.seek);
  const [scrub, setScrub] = useState<number | null>(null);

  const max = Number.isFinite(duration) ? (duration as number) : 0;
  const shown = scrub ?? position;

  return (
    <div data-slot="mobile-seek" className="absolute inset-x-0 top-0 z-10 md:hidden">
      <Slider
        className="[&_[data-slot=slider-control]]:h-3 [&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:rounded-none [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-thumb]]:size-2.5 [&_[data-slot=slider-thumb]]:border-0"
        min={0}
        max={max || 1}
        step={0.1}
        value={[shown]}
        getAriaLabel={() => "Seek"}
        onValueChange={(value) => setScrub(Array.isArray(value) ? value[0] : value)}
        onValueCommitted={(value) => {
          seek(Array.isArray(value) ? value[0] : value);
          setScrub(null);
        }}
      />
    </div>
  );
}

export function SeekBar({ fallbackDuration }: { fallbackDuration: number }) {
  const position = usePlayer((s) => s.position);
  const duration = usePlayer((s) => s.duration);
  const seek = usePlayer((s) => s.seek);
  const [scrub, setScrub] = useState<number | null>(null);

  const max = Number.isFinite(duration) ? (duration as number) : fallbackDuration;
  const shown = scrub ?? position;

  return (
    <>
      <span className="w-9 text-right text-xs tabular-nums text-white/70">{formatTime(shown)}</span>
      <Slider
        className="flex-1"
        min={0}
        max={max || 1}
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

export function LikeButton({ songId }: { songId: number }) {
  const { data: isLiked = false } = useIsLiked(songId);
  const setLiked = useSetLiked();
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (!isLiked) return;
    setPop(true);
    const t = setTimeout(() => setPop(false), 200);
    return () => clearTimeout(t);
  }, [isLiked]);

  const toggle = (liked: boolean) => setLiked.mutate({ songId, liked });

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            onClick={() => {
              toggle(!isLiked);
              if (isLiked) {
                toast("Removed from Liked Songs", {
                  action: { label: "Undo", onClick: () => toggle(true) },
                });
              } else {
                toast.success("Saved to Liked Songs");
              }
            }}
            aria-label={isLiked ? "Unlike" : "Like"}
            aria-pressed={isLiked}
            className={cn(
              "btn-ghost flex h-11 w-11 items-center justify-center rounded-full",
              isLiked && "text-red-500",
            )}
          />
        }
      >
        <Heart
          className={cn(
            "h-[18px] w-[18px] transition-transform duration-200 ease-out",
            pop && "scale-125",
            isLiked && "fill-current",
          )}
        />
      </TooltipTrigger>
      <TooltipContent>{isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}</TooltipContent>
    </Tooltip>
  );
}

export function SpeedControl() {
  const speed = usePlayer((s) => s.speed);
  const setSpeed = usePlayer((s) => s.setSpeed);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Playback speed"
        className="btn-ghost rounded-lg px-3 py-1.5 text-sm font-semibold"
      >
        {speed}×
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close speed menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 bottom-full z-50 mb-2 flex origin-bottom-right flex-col gap-1 rounded-lg border border-white/10 bg-[#1f1f1f] p-2 shadow-2xl"
          >
            {[0.5, 1, 1.25, 1.5, 2].map((v) => (
              <button
                key={v}
                type="button"
                role="menuitem"
                onClick={() => {
                  setSpeed(v);
                  setOpen(false);
                }}
                className="rounded px-2 py-1 text-left text-sm transition-colors duration-100 ease-out hover:bg-white/10 active:scale-[0.97]"
              >
                {v}×
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NowPlayingButton() {
  const isNowPlayingOpen = usePlayer((s) => s.isNowPlayingOpen);
  const toggleNowPlaying = usePlayer((s) => s.toggleNowPlaying);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            id="now-playing-trigger"
            onClick={toggleNowPlaying}
            aria-label={isNowPlayingOpen ? "Exit now playing" : "Open now playing"}
            aria-expanded={isNowPlayingOpen}
            className="btn-ghost hidden h-9 w-9 items-center justify-center rounded-full md:flex"
          />
        }
      >
        {isNowPlayingOpen ? (
          <Minimize2 className="h-[18px] w-[18px]" />
        ) : (
          <Maximize2 className="h-[18px] w-[18px]" />
        )}
      </TooltipTrigger>
      <TooltipContent>{isNowPlayingOpen ? "Collapse now playing" : "Now playing"}</TooltipContent>
    </Tooltip>
  );
}

export function PlayerBar() {
  const currentSongId = usePlayer((s) => s.currentSongId);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const isBuffering = usePlayer((s) => s.isBuffering);
  const showBuffering = useDelayedFlag(isBuffering, 200);
  const play = usePlayer((s) => s.play);
  const togglePlay = usePlayer((s) => s.togglePlay);
  const next = usePlayer((s) => s.next);
  const prev = usePlayer((s) => s.prev);
  const setNowPlayingOpen = usePlayer((s) => s.setNowPlayingOpen);
  const { data: songs = [] } = useSongs();

  const touchStartY = useRef<number | null>(null);

  const song = songs.find((s) => s.id === currentSongId) ?? null;
  const idle = song === null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current !== null) {
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (diff > 40) {
        setNowPlayingOpen(true);
      }
      touchStartY.current = null;
    }
  };

  return (
    <div
      data-slot="player-bar"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative flex items-center gap-2 border-t border-white/5 bg-[var(--bg-card)] px-3 py-3 sm:gap-3 sm:px-4 sm:py-4"
    >
      <MobileSeek />

      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined" && window.innerWidth < 768) {
            setNowPlayingOpen(true);
          } else if (song) {
            play(song);
          }
        }}
        disabled={idle}
        className="btn-ghost flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1.5 disabled:cursor-default sm:flex-none"
      >
        <div
          className={cn(
            "relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg sm:h-14 sm:w-14",
            isPlaying && "motion-safe:animate-[sunao-pulse_2.4s_ease-in-out_infinite]",
          )}
          style={{
            background: song?.color ?? "#282828",
            boxShadow: song?.color ? `0 0 28px ${song.color}55` : undefined,
          }}
        >
          {song?.artwork ? (
            <Image src={song.artwork} alt={song.title} fill sizes="56px" className="object-cover" />
          ) : (
            <Music className="h-5 w-5 text-white/30" />
          )}
        </div>
        <div className="min-w-0 text-left sm:max-w-44">
          <p className="truncate text-sm font-semibold">{song?.title ?? "Nothing playing"}</p>
          <p className="truncate text-xs text-white/60">
            {song?.artist ?? "Choose a song to start"}
          </p>
        </div>
      </button>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                onClick={prev}
                aria-label="Previous track"
                disabled={idle}
                className="btn-ghost flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-40"
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
                disabled={idle}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white transition-[background-color,transform] duration-normal ease-out hover:bg-red-700 active:scale-95 disabled:cursor-default disabled:bg-white/10 disabled:text-white/40"
              />
            }
          >
            {showBuffering && isPlaying ? (
              <div className="animate-spin">
                <Loader2 className="h-5 w-5" />
              </div>
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
                disabled={idle}
                className="btn-ghost flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-40"
              />
            }
          >
            <SkipForward className="h-[18px] w-[18px]" />
          </TooltipTrigger>
          <TooltipContent>Next</TooltipContent>
        </Tooltip>
      </div>

      <div className="hidden min-w-0 max-w-[620px] flex-1 items-center gap-3 md:flex">
        <SeekBar fallbackDuration={song?.duration ?? 0} />
      </div>

      <div className="ml-auto flex items-center gap-1 md:ml-0">
        {song && <LikeButton songId={song.id} />}
      </div>

      <SpeedControl />
      <NowPlayingButton />
    </div>
  );
}
