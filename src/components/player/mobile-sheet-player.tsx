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
import { useCallback, useEffect, useRef, useState } from "react";
import { LikeButton, SeekBar, SpeedControl } from "@/components/layout/player-bar";
import { QueueContent } from "@/components/layout/queue-panel";
import { LyricsPanel } from "@/components/player/lyrics-panel";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useDelayedFlag } from "@/hooks/use-delayed-flag";
import { useSongs } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/stores/player";

export function MobileSheetPlayer() {
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
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const triggerRef = useRef<HTMLElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  const song = songs.find((s) => s.id === currentSongId) ?? null;
  const idle = song === null;

  const dismiss = useCallback(() => {
    setNowPlayingOpen(false);
    setDragY(0);
    setIsDragging(false);
  }, [setNowPlayingOpen]);

  // Touch gesture handling for swipe down to dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    setDragY(Math.max(0, diff));
  };

  const handleTouchEnd = () => {
    if (touchStartY.current === null) return;
    const duration = Date.now() - touchStartTime.current;
    const velocity = duration > 0 ? dragY / duration : 0;

    // Dismiss if dragged down more than 80px or with flick velocity > 0.4 px/ms
    if (dragY > 80 || velocity > 0.4) {
      dismiss();
    } else {
      setDragY(0);
      setIsDragging(false);
    }
    touchStartY.current = null;
  };

  // Manage focus return on close
  useEffect(() => {
    if (isNowPlayingOpen) {
      if (document.activeElement instanceof HTMLElement) {
        triggerRef.current = document.activeElement;
      }
    } else if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isNowPlayingOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isNowPlayingOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isNowPlayingOpen, dismiss]);

  return (
    <>
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Now playing"
        aria-hidden={!isNowPlayingOpen}
        inert={!isNowPlayingOpen}
        data-slot="mobile-sheet-player"
        className={cn(
          "fixed inset-x-0 bottom-0 top-0 z-50 flex flex-col justify-between overflow-hidden bg-background/98 p-5 pb-8 backdrop-blur-2xl md:hidden",
          isNowPlayingOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none translate-y-full opacity-0",
        )}
        style={{
          transform: isNowPlayingOpen ? `translateY(${dragY}px)` : "translateY(100%)",
          transition: isDragging
            ? "none"
            : "transform 300ms cubic-bezier(0.32, 0.72, 0, 1), opacity 200ms ease",
          backgroundImage: song?.color
            ? `radial-gradient(circle at 50% 25%, ${song.color}44 0%, transparent 75%)`
            : undefined,
        }}
      >
        {/* Swipe-down handle area */}
        <div
          data-slot="drag-handle-area"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex flex-col items-center pt-1 pb-2 touch-none select-none cursor-grab active:cursor-grabbing"
        >
          <div
            data-slot="grab-handle"
            className="h-1.5 w-12 rounded-full bg-white/30 transition-colors hover:bg-white/50"
          />
        </div>

        {/* Top Header */}
        <div className="flex items-center justify-between pb-2">
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close now playing"
            className="btn-ghost flex h-10 w-10 items-center justify-center rounded-full"
          >
            <ChevronDown className="h-6 w-6" />
          </button>

          {/* Tab switcher: Cover / Lyrics */}
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("artwork")}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-150 ease-out",
                activeTab === "artwork"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/60 hover:text-white",
              )}
            >
              <Music2 className="h-3 w-3" />
              Cover
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("lyrics")}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-150 ease-out",
                activeTab === "lyrics"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/60 hover:text-white",
              )}
            >
              <Mic2 className="h-3 w-3" />
              Lyrics
            </button>
          </div>

          <button
            type="button"
            onClick={() => setQueueOpen(true)}
            aria-label="Open queue"
            className="btn-ghost flex h-10 w-10 items-center justify-center rounded-full"
          >
            <ListMusic className="h-5 w-5" />
          </button>
        </div>

        {/* Center: Extra-large Artwork or Lyrics */}
        <div className="flex min-h-0 flex-1 items-center justify-center py-2">
          {activeTab === "artwork" ? (
            <div
              className={cn(
                "relative flex size-64 items-center justify-center overflow-hidden rounded-2xl shadow-2xl transition-transform duration-300 sm:size-72",
                isPlaying && "motion-safe:animate-[sunao-pulse_2.4s_ease-in-out_infinite]",
              )}
              style={{
                background: song?.color ?? "#282828",
                boxShadow: song?.color ? `0 0 50px ${song.color}55` : undefined,
              }}
            >
              {song?.artwork ? (
                <Image
                  src={song.artwork}
                  alt={song.title}
                  fill
                  sizes="320px"
                  priority
                  className="object-cover"
                />
              ) : (
                <Music className="h-16 w-16 text-white/20" />
              )}
            </div>
          ) : (
            <LyricsPanel song={song} className="h-full w-full" />
          )}
        </div>

        {/* Controls Section */}
        <div className="flex flex-col gap-3 pt-2">
          {/* Song info and Like button */}
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-3">
              <h2 className="truncate text-xl font-bold text-white">
                {song?.title ?? "Nothing playing"}
              </h2>
              <p className="truncate text-sm text-white/60">
                {song?.artist ?? "Choose a song to start"}
              </p>
            </div>
            {song && <LikeButton songId={song.id} />}
          </div>

          {/* Seek Bar */}
          <div className="flex items-center gap-2">
            <SeekBar fallbackDuration={song?.duration ?? 0} />
          </div>

          {/* Transport Controls */}
          <div className="flex items-center justify-between pt-1">
            <SpeedControl />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous track"
                disabled={idle}
                className="btn-ghost flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-40"
              >
                <SkipBack className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                disabled={idle}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-[background-color,transform] duration-normal ease-out active:scale-95 disabled:cursor-default disabled:bg-white/10 disabled:text-white/40"
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
              </button>

              <button
                type="button"
                onClick={next}
                aria-label="Next track"
                disabled={idle}
                className="btn-ghost flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-40"
              >
                <SkipForward className="h-6 w-6" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "lyrics" ? "artwork" : "lyrics")}
              aria-label="Toggle lyrics"
              aria-pressed={activeTab === "lyrics"}
              className={cn(
                "btn-ghost flex h-10 w-10 items-center justify-center rounded-full",
                activeTab === "lyrics" && "bg-white/15 text-white",
              )}
            >
              <Mic2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Queue Drawer Sheet */}
      <Sheet open={queueOpen} onOpenChange={setQueueOpen}>
        <SheetContent side="bottom" className="max-h-[80dvh] p-4" showCloseButton={false}>
          <SheetTitle className="sr-only">Queue</SheetTitle>
          <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-white/20" />
          <QueueContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
