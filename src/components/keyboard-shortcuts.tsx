"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useIsLiked, useSetLiked } from "@/lib/queries";
import { usePlayer } from "@/stores/player";

export function KeyboardShortcuts() {
  const currentSongId = usePlayer((s) => s.currentSongId);
  const volume = usePlayer((s) => s.volume);
  const togglePlay = usePlayer((s) => s.togglePlay);
  const next = usePlayer((s) => s.next);
  const prev = usePlayer((s) => s.prev);
  const setVolume = usePlayer((s) => s.setVolume);

  const { data: isLiked = false } = useIsLiked(currentSongId ?? -1);
  const setLiked = useSetLiked();

  const stateRef = useRef({
    currentSongId,
    volume,
    isLiked,
    togglePlay,
    next,
    prev,
    setVolume,
    setLiked,
  });

  useEffect(() => {
    stateRef.current = {
      currentSongId,
      volume,
      isLiked,
      togglePlay,
      next,
      prev,
      setVolume,
      setLiked,
    };
  });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const { currentSongId, volume, isLiked, togglePlay, next, prev, setVolume, setLiked } =
        stateRef.current;

      // Space: play/pause
      if (event.code === "Space" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        togglePlay();
        return;
      }

      // Shift+N or J: next track
      if (
        (event.shiftKey && (event.key === "N" || event.key === "n")) ||
        (!event.shiftKey &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey &&
          (event.key === "j" || event.key === "J"))
      ) {
        event.preventDefault();
        next();
        return;
      }

      // Shift+P or K: previous track
      if (
        (event.shiftKey && (event.key === "P" || event.key === "p")) ||
        (!event.shiftKey &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey &&
          (event.key === "k" || event.key === "K"))
      ) {
        event.preventDefault();
        prev();
        return;
      }

      // L: like/unlike current track
      if (
        !event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        (event.key === "l" || event.key === "L")
      ) {
        if (currentSongId !== null) {
          event.preventDefault();
          const targetLiked = !isLiked;
          setLiked.mutate({ songId: currentSongId, liked: targetLiked });
          if (isLiked) {
            toast("Removed from Liked Songs", {
              action: {
                label: "Undo",
                onClick: () => setLiked.mutate({ songId: currentSongId, liked: true }),
              },
            });
          } else {
            toast.success("Saved to Liked Songs");
          }
        }
        return;
      }

      // ArrowUp: volume up (step 0.05)
      if (
        !event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        event.key === "ArrowUp"
      ) {
        event.preventDefault();
        const nextVolume = Math.min(1, Math.round((volume + 0.05) * 100) / 100);
        setVolume(nextVolume);
        return;
      }

      // ArrowDown: volume down (step 0.05)
      if (
        !event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        event.key === "ArrowDown"
      ) {
        event.preventDefault();
        const nextVolume = Math.max(0, Math.round((volume - 0.05) * 100) / 100);
        setVolume(nextVolume);
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return null;
}
