import { create } from "zustand";
import type { Song } from "@/types";

type PlayerState = {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  speed: number;
  queue: number[];
  liked: Set<number>;
  play: (song: Song) => void;
  togglePlay: () => void;
  seek: (position: number) => void;
  setSpeed: (speed: number) => void;
  next: () => void;
  prev: () => void;
  toggleLike: (id: number) => void;
};

export const usePlayer = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  position: 0,
  speed: 1,
  queue: [],
  liked: new Set(),
  play: (song) => set({ currentSong: song, position: 0, isPlaying: true }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  seek: (position) => set({ position }),
  setSpeed: (speed) => set({ speed }),
  next: () => {
    const { queue, currentSong } = get();
    if (!currentSong || queue.length === 0) return;
    const idx = queue.indexOf(currentSong.id);
    const nextId = queue[(idx + 1) % queue.length];
    set({ currentSong: { ...currentSong, id: nextId }, position: 0 });
  },
  prev: () => {
    const { queue, currentSong, position } = get();
    if (!currentSong) return;
    if (position > 3) {
      set({ position: 0 });
      return;
    }
    const idx = queue.indexOf(currentSong.id);
    const prevId = queue[(idx - 1 + queue.length) % queue.length];
    set({ currentSong: { ...currentSong, id: prevId }, position: 0 });
  },
  toggleLike: (id) =>
    set((s) => {
      const next = new Set(s.liked);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { liked: next };
    }),
}));
