import { create } from "zustand";
import { SONGS } from "@/lib/data/songs";
import type { Song } from "@/types";

type PlayerState = {
  currentSongId: number | null;
  isPlaying: boolean;
  position: number;
  speed: number;
  queue: number[];
  liked: Set<number>;
  play: (song: Song | number) => void;
  togglePlay: () => void;
  seek: (position: number) => void;
  setSpeed: (speed: number) => void;
  next: () => void;
  prev: () => void;
  toggleLike: (id: number) => void;
  currentSong: () => Song | null;
  getCurrentSong: () => Song | null;
};

function resolveSong(id: number | null): Song | null {
  if (id === null) return null;
  return SONGS.find((song) => song.id === id) ?? null;
}

export const usePlayer = create<PlayerState>((set, get) => ({
  currentSongId: 1,
  isPlaying: false,
  position: 0,
  speed: 1,
  queue: SONGS.map((song) => song.id),
  liked: new Set<number>([1, 3, 5]),
  play: (song) => {
    const id = typeof song === "number" ? song : song.id;
    set({ currentSongId: id, position: 0, isPlaying: true });
  },
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  seek: (position) => set({ position }),
  setSpeed: (speed) => set({ speed }),
  next: () => {
    const { currentSongId, queue } = get();
    if (currentSongId === null) return;
    const list =
      queue.length > 0 && queue.includes(currentSongId) ? queue : SONGS.map((song) => song.id);
    const index = list.indexOf(currentSongId);
    const nextId = list[(index + 1) % list.length];
    set({ currentSongId: nextId, position: 0 });
  },
  prev: () => {
    const { currentSongId, queue, position } = get();
    if (currentSongId === null) return;
    if (position > 3) {
      set({ position: 0 });
      return;
    }
    const list =
      queue.length > 0 && queue.includes(currentSongId) ? queue : SONGS.map((song) => song.id);
    const index = list.indexOf(currentSongId);
    const prevId = list[(index - 1 + list.length) % list.length];
    set({ currentSongId: prevId, position: 0 });
  },
  toggleLike: (id) =>
    set((state) => {
      const next = new Set(state.liked);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { liked: next };
    }),
  currentSong: () => resolveSong(get().currentSongId),
  getCurrentSong: () => resolveSong(get().currentSongId),
}));

export const selectCurrentSong = (state: PlayerState): Song | null =>
  resolveSong(state.currentSongId);

export function getCurrentSong(): Song | null {
  return usePlayer.getState().getCurrentSong();
}
