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
  customSongs: Record<number, Song>;
  play: (song: Song | number) => void;
  registerSongs: (songs: Song[]) => void;
  togglePlay: () => void;
  seek: (position: number) => void;
  setSpeed: (speed: number) => void;
  setQueue: (ids: number[]) => void;
  setBuffering: (buffering: boolean) => void;
  setDuration: (duration: number | null) => void;
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
  customSongs: {},
  registerSongs: (songs) => {
    set((state) => {
      const next = { ...state.customSongs };
      for (const s of songs) {
        next[s.id] = s;
      }
      return { customSongs: next };
    });
  },
  play: (song) => {
    if (typeof song === "number") {
      set({ currentSongId: song, position: 0, isPlaying: true });
    } else {
      set((state) => ({
        currentSongId: song.id,
        position: 0,
        isPlaying: true,
        customSongs: { ...state.customSongs, [song.id]: song },
      }));
    }
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
