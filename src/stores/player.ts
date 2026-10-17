import { create } from "zustand";
import type { Song } from "@/types";

export type RepeatMode = "off" | "all" | "one";

export const PLAYER_STORAGE_KEY = "sunao.player.v1";

export type PlayerPreferences = {
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
};

const defaultPreferences: PlayerPreferences = {
  volume: 1,
  isMuted: false,
  isShuffle: false,
  repeatMode: "off",
};

export function readStoredPreferences(): PlayerPreferences {
  if (typeof window === "undefined") return { ...defaultPreferences };
  try {
    const raw = window.localStorage.getItem(PLAYER_STORAGE_KEY);
    if (!raw) return { ...defaultPreferences };
    const parsed = JSON.parse(raw);
    const volume =
      typeof parsed?.volume === "number" && !Number.isNaN(parsed.volume)
        ? Math.min(1, Math.max(0, parsed.volume))
        : 1;
    const isMuted = typeof parsed?.isMuted === "boolean" ? parsed.isMuted : false;
    const isShuffle = typeof parsed?.isShuffle === "boolean" ? parsed.isShuffle : false;
    const repeatMode: RepeatMode =
      parsed?.repeatMode === "all" || parsed?.repeatMode === "one" ? parsed.repeatMode : "off";
    return { volume, isMuted, isShuffle, repeatMode };
  } catch {
    return { ...defaultPreferences };
  }
}

export function writeStoredPreferences(prefs: Partial<PlayerPreferences>) {
  if (typeof window === "undefined") return;
  try {
    const current = readStoredPreferences();
    const updated = { ...current, ...prefs };
    window.localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage write failures (quota exceeded, private mode)
  }
}

function shuffleArray<T>(array: readonly T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

export type PlayerState = {
  currentSongId: number | null;
  isPlaying: boolean;
  isBuffering: boolean;
  position: number;
  duration: number | null;
  speed: number;
  queue: number[];
  originalQueue: number[];
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  customSongs: Record<number, Song>;
  isNowPlayingOpen: boolean;
  play: (song: Song | number) => void;
  registerSongs: (songs: Song[]) => void;
  togglePlay: () => void;
  seek: (position: number) => void;
  setSpeed: (speed: number) => void;
  setQueue: (ids: number[]) => void;
  setBuffering: (buffering: boolean) => void;
  setDuration: (duration: number | null) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleRepeat: () => void;
  setNowPlayingOpen: (open: boolean) => void;
  toggleNowPlaying: () => void;
  next: () => void;
  prev: () => void;
};

const initialPrefs = readStoredPreferences();

export const usePlayer = create<PlayerState>((set, get) => ({
  currentSongId: null,
  isPlaying: false,
  isBuffering: false,
  position: 0,
  duration: null,
  speed: 1,
  queue: [],
  originalQueue: [],
  volume: initialPrefs.volume,
  isMuted: initialPrefs.isMuted,
  isShuffle: initialPrefs.isShuffle,
  repeatMode: initialPrefs.repeatMode,
  customSongs: {},
  isNowPlayingOpen: false,
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
  setQueue: (ids) => {
    const { isShuffle, currentSongId } = get();
    if (isShuffle) {
      let newQueue: number[];
      if (currentSongId !== null && ids.includes(currentSongId)) {
        const idx = ids.indexOf(currentSongId);
        const rest = [...ids.slice(0, idx), ...ids.slice(idx + 1)];
        newQueue = [currentSongId, ...shuffleArray(rest)];
      } else {
        newQueue = shuffleArray(ids);
      }
      set({ originalQueue: ids, queue: newQueue });
    } else {
      set({ originalQueue: ids, queue: ids });
    }
  },
  setBuffering: (buffering) => set({ isBuffering: buffering }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => {
    const clamped = Math.min(1, Math.max(0, Math.round(volume * 100) / 100));
    const nextMuted = clamped > 0 && get().isMuted ? false : get().isMuted;
    set({ volume: clamped, isMuted: nextMuted });
    writeStoredPreferences({ volume: clamped, isMuted: nextMuted });
  },
  toggleMute: () => {
    const { isMuted, volume } = get();
    if (isMuted) {
      const nextVolume = volume === 0 ? 0.25 : volume;
      set({ isMuted: false, volume: nextVolume });
      writeStoredPreferences({ isMuted: false, volume: nextVolume });
    } else {
      set({ isMuted: true });
      writeStoredPreferences({ isMuted: true });
    }
  },
  toggleShuffle: () => {
    const { isShuffle, queue, originalQueue, currentSongId } = get();
    const nextShuffle = !isShuffle;
    if (nextShuffle) {
      const base = originalQueue.length > 0 ? originalQueue : queue;
      let newQueue: number[];
      if (currentSongId !== null && base.includes(currentSongId)) {
        const idx = base.indexOf(currentSongId);
        const rest = [...base.slice(0, idx), ...base.slice(idx + 1)];
        newQueue = [currentSongId, ...shuffleArray(rest)];
      } else {
        newQueue = shuffleArray(base);
      }
      set({ isShuffle: true, originalQueue: base, queue: newQueue });
      writeStoredPreferences({ isShuffle: true });
    } else {
      const restored = originalQueue.length > 0 ? originalQueue : queue;
      set({ isShuffle: false, queue: restored });
      writeStoredPreferences({ isShuffle: false });
    }
  },
  setRepeatMode: (mode) => {
    set({ repeatMode: mode });
    writeStoredPreferences({ repeatMode: mode });
  },
  toggleRepeat: () => {
    const current = get().repeatMode;
    const next: RepeatMode = current === "off" ? "all" : current === "all" ? "one" : "off";
    set({ repeatMode: next });
    writeStoredPreferences({ repeatMode: next });
  },
  setNowPlayingOpen: (open) => set({ isNowPlayingOpen: open }),
  toggleNowPlaying: () => set((state) => ({ isNowPlayingOpen: !state.isNowPlayingOpen })),
  next: () => {
    const { currentSongId, queue } = get();
    if (currentSongId === null || queue.length === 0) return;
    const index = queue.indexOf(currentSongId);
    if (index === -1) return;
    set({ currentSongId: queue[(index + 1) % queue.length], position: 0 });
  },
  prev: () => {
    const { currentSongId, queue, position } = get();
    if (currentSongId === null || queue.length === 0) return;
    if (position > 3) {
      set({ position: 0 });
      return;
    }
    const index = queue.indexOf(currentSongId);
    if (index === -1) return;
    set({ currentSongId: queue[(index - 1 + queue.length) % queue.length], position: 0 });
  },
}));
