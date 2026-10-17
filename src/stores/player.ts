import { create } from "zustand";
import type { Song } from "@/types";

type PlayerState = {
  currentSongId: number | null;
  isPlaying: boolean;
  isBuffering: boolean;
  position: number;
  duration: number | null;
  speed: number;
  queue: number[];
  isNowPlayingOpen: boolean;
  play: (song: Song | number) => void;
  togglePlay: () => void;
  seek: (position: number) => void;
  setSpeed: (speed: number) => void;
  setQueue: (ids: number[]) => void;
  setBuffering: (buffering: boolean) => void;
  setDuration: (duration: number | null) => void;
  setNowPlayingOpen: (open: boolean) => void;
  toggleNowPlaying: () => void;
  next: () => void;
  prev: () => void;
};

export const usePlayer = create<PlayerState>((set, get) => ({
  currentSongId: null,
  isPlaying: false,
  isBuffering: false,
  position: 0,
  duration: null,
  speed: 1,
  queue: [],
  isNowPlayingOpen: false,
  play: (song) => {
    const id = typeof song === "number" ? song : song.id;
    set({ currentSongId: id, position: 0, isPlaying: true });
  },
  togglePlay: () => {
    const { currentSongId, isPlaying } = get();
    if (currentSongId === null) return;
    set({ isPlaying: !isPlaying });
  },
  seek: (position) => set({ position }),
  setSpeed: (speed) => set({ speed }),
  setQueue: (ids) => set({ queue: ids }),
  setBuffering: (buffering) => set({ isBuffering: buffering }),
  setDuration: (duration) => set({ duration }),
  setNowPlayingOpen: (open) => set({ isNowPlayingOpen: open }),
  toggleNowPlaying: () => set((state) => ({ isNowPlayingOpen: !state.isNowPlayingOpen })),
  next: () => {
    const { currentSongId, queue } = get();
    if (currentSongId === null) return;
    const index = queue.indexOf(currentSongId);
    if (index === -1) return;
    set({ currentSongId: queue[(index + 1) % queue.length], position: 0 });
  },
  prev: () => {
    const { currentSongId, queue, position } = get();
    if (currentSongId === null) return;
    if (position > 3) {
      set({ position: 0 });
      return;
    }
    const index = queue.indexOf(currentSongId);
    if (index === -1) return;
    set({ currentSongId: queue[(index - 1 + queue.length) % queue.length], position: 0 });
  },
}));
