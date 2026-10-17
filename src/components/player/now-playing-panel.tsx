"use client";

import {
  ChevronDown,
  ListMusic,
  Loader2,
  Mic2,
  Music,
  Music2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { LikeButton, SeekBar, SpeedControl } from "@/components/layout/player-bar";
import { QueueContent } from "@/components/layout/queue-panel";
import { LyricsPanel } from "@/components/player/lyrics-panel";
import { Kbd } from "@/components/ui/kbd";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDelayedFlag } from "@/hooks/use-delayed-flag";
import { useSongs } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/stores/player";

export function NowPlayingPanel() {
  const isNowPlayingOpen = usePlayer((s) => s.isNowPlayingOpen);
  const setNowPlayingOpen = usePlayer((s) => s.setNowPlayingOpen);
  const currentSongId = usePlayer((s) => s.currentSongId);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const isBuffering = usePlayer((s) => s.isBuffering);
  const showBuffering = useDelayedFlag(isBuffering, 200);
  const togglePlay = usePlayer((s) => s.togglePlay);
  const next = usePlayer((s) => s.next);
  const prev = usePlayer((s) => s.prev);
  const { data: songs = [] } = useSongs();

  const [activeTab, setActiveTab] = useState<"artwork" | "lyrics">("artwork");
  const [queueOpen, setQueueOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const song = songs.find((s) => s.id === currentSongId) ?? null;
  const idle = song === null;

  // Track the opening trigger and manage focus return on close
  useEffect(() => {
    if (isNowPlayingOpen) {
      if (document.activeElement instanceof HTMLElement) {
        triggerRef.current = document.activeElement;
      }
      // Focus close button on open
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    } else if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isNowPlayingOpen]);

  // Handle Escape key to dismiss
  useEffect(() => {
    if (!isNowPlayingOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setNowPlayingOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isNowPlayingOpen, setNowPlayingOpen]);

  if (!isNowPlayingOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Now playing"
      data-slot="now-playing-panel"
      className="fixed inset-0 z-50 hidden flex-col justify-between overflow-hidden bg-background/95 p-6 backdrop-blur-2xl transition-all duration-300 md:flex lg:p-10"
      style={{
        backgroundImage: song?.color
          ? `radial-gradient(circle at 50% 30%, ${song.color}33 0%, transparent 70%)`
          : undefined,
      }}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setNowPlayingOpen(false)}
                aria-label="Close now playing"
                className="btn-ghost flex h-10 w-10 items-center justify-center rounded-full"
              />
            }
          >
            <ChevronDown className="h-6 w-6" />
          </TooltipTrigger>
          <TooltipContent>
            Close <Kbd>Esc</Kbd>
          </TooltipContent>
        </Tooltip>

        {/* View Switcher: Artwork / Lyrics */}
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("artwork")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-150 ease-out",
              activeTab === "artwork"
                ? "bg-white/20 text-white shadow-sm"
                : "text-white/60 hover:text-white",
            )}
          >
            <Music2 className="h-3.5 w-3.5" />
            Cover
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("lyrics")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-150 ease-out",
              activeTab === "lyrics"
                ? "bg-white/20 text-white shadow-sm"
                : "text-white/60 hover:text-white",
            )}
          >
            <Mic2 className="h-3.5 w-3.5" />
            Lyrics
          </button>
        </div>

        {/* Queue Drawer Link */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={() => setQueueOpen(true)}
                aria-label="Open queue drawer"
                className="btn-ghost flex h-10 items-center gap-2 rounded-full px-3"
              />
            }
          >
            <ListMusic className="h-5 w-5" />
            <span className="hidden text-xs font-semibold lg:inline">Queue</span>
          </TooltipTrigger>
          <TooltipContent>Queue drawer</TooltipContent>
        </Tooltip>
      </div>

      {/* Main Center Area: Extra-large Artwork or Lyrics */}
      <div className="flex min-h-0 flex-1 items-center justify-center py-4">
        {activeTab === "artwork" ? (
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "relative flex size-64 items-center justify-center overflow-hidden rounded-2xl shadow-2xl transition-transform duration-300 sm:size-80 md:size-96 lg:size-[420px]",
                isPlaying && "motion-safe:animate-[sunao-pulse_3s_ease-in-out_infinite]",
              )}
              style={{
                background: song?.color ?? "#282828",
                boxShadow: song?.color ? `0 0 60px ${song.color}66` : undefined,
              }}
            >
              {song?.artwork ? (
                <Image
                  src={song.artwork}
                  alt={song.title}
                  fill
                  sizes="420px"
                  priority
                  className="object-cover"
                />
              ) : (
                <Music className="h-20 w-20 text-white/20" />
              )}
            </div>
          </div>
        ) : (
          <LyricsPanel song={song} className="h-full max-h-[500px] w-full max-w-2xl" />
        )}
      </div>

      {/* Bottom Controls Area */}
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        {/* Track Title, Artist, and Like Button */}
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <h2 className="truncate text-xl font-bold text-white sm:text-2xl lg:text-3xl">
              {song?.title ?? "Nothing playing"}
            </h2>
            <p className="truncate text-sm text-white/60 sm:text-base">
              {song?.artist ?? "Choose a song to start"}
            </p>
          </div>
          {song && <LikeButton songId={song.id} />}
        </div>

        {/* Seek Slider */}
        <div className="flex items-center gap-3">
          <SeekBar fallbackDuration={song?.duration ?? 0} />
        </div>

        {/* Transport Controls */}
        <div className="flex items-center justify-between pt-2">
          <SpeedControl />

          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={prev}
                    aria-label="Previous track"
                    disabled={idle}
                    className="btn-ghost flex h-12 w-12 items-center justify-center rounded-full disabled:opacity-40"
                  />
                }
              >
                <SkipBack className="h-6 w-6" />
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
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-[background-color,transform] duration-normal ease-out hover:bg-red-700 active:scale-95 disabled:cursor-default disabled:bg-white/10 disabled:text-white/40"
                  />
                }
              >
                {showBuffering && isPlaying ? (
                  <div className="animate-spin">
                    <Loader2 className="h-7 w-7" />
                  </div>
                ) : isPlaying ? (
                  <Pause className="h-7 w-7" />
                ) : (
                  <Play className="h-7 w-7 translate-x-0.5" />
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
                    className="btn-ghost flex h-12 w-12 items-center justify-center rounded-full disabled:opacity-40"
                  />
                }
              >
                <SkipForward className="h-6 w-6" />
              </TooltipTrigger>
              <TooltipContent>Next</TooltipContent>
            </Tooltip>
          </div>

          {/* Lyrics toggle button on bottom row */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === "lyrics" ? "artwork" : "lyrics")}
                  aria-label="Toggle lyrics"
                  aria-pressed={activeTab === "lyrics"}
                  className={cn(
                    "btn-ghost flex h-10 w-10 items-center justify-center rounded-full",
                    activeTab === "lyrics" && "bg-white/15 text-white",
                  )}
                />
              }
            >
              <Mic2 className="h-5 w-5" />
            </TooltipTrigger>
            <TooltipContent>Lyrics</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Queue Drawer Link Sheet */}
      <Sheet open={queueOpen} onOpenChange={setQueueOpen}>
        <SheetContent
          side="right"
          className="w-80 max-w-[85vw] border-l border-white/10 bg-[var(--bg-card)] p-4 shadow-2xl"
        >
          <SheetTitle className="sr-only">Queue</SheetTitle>
          <QueueContent />
        </SheetContent>
      </Sheet>
    </div>
  );
}
