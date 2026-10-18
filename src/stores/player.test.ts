import { beforeEach, describe, expect, it } from "vitest";
import {
  PLAYER_STORAGE_KEY,
  readStoredPreferences,
  usePlayer,
  writeStoredPreferences,
} from "./player";

describe("player store", () => {
  beforeEach(() => {
    localStorage.clear();
    usePlayer.setState({
      currentSongId: null,
      isPlaying: false,
      isBuffering: false,
      position: 0,
      duration: null,
      speed: 1,
      queue: [],
      originalQueue: [],
      volume: 1,
      isMuted: false,
      isShuffle: false,
      repeatMode: "off",
    });
  });

  describe("volume control", () => {
    it("has default volume of 1 and isMuted of false", () => {
      const state = usePlayer.getState();
      expect(state.volume).toBe(1);
      expect(state.isMuted).toBe(false);
    });

    it("adjusts volume and persists to localStorage", () => {
      usePlayer.getState().setVolume(0.65);

      expect(usePlayer.getState().volume).toBe(0.65);
      const stored = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) ?? "{}");
      expect(stored.volume).toBe(0.65);
    });

    it("clamps volume between 0 and 1", () => {
      usePlayer.getState().setVolume(-0.5);
      expect(usePlayer.getState().volume).toBe(0);

      usePlayer.getState().setVolume(1.8);
      expect(usePlayer.getState().volume).toBe(1);
    });

    it("toggles mute state and persists", () => {
      usePlayer.getState().toggleMute();
      expect(usePlayer.getState().isMuted).toBe(true);

      let stored = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) ?? "{}");
      expect(stored.isMuted).toBe(true);

      usePlayer.getState().toggleMute();
      expect(usePlayer.getState().isMuted).toBe(false);

      stored = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) ?? "{}");
      expect(stored.isMuted).toBe(false);
    });

    it("unmutes when adjusting volume above 0", () => {
      usePlayer.getState().toggleMute();
      expect(usePlayer.getState().isMuted).toBe(true);

      usePlayer.getState().setVolume(0.8);
      expect(usePlayer.getState().isMuted).toBe(false);
      expect(usePlayer.getState().volume).toBe(0.8);
    });

    it("restores audible volume when unmuting from volume 0", () => {
      usePlayer.getState().setVolume(0);
      usePlayer.getState().toggleMute();
      usePlayer.getState().toggleMute();

      expect(usePlayer.getState().isMuted).toBe(false);
      expect(usePlayer.getState().volume).toBe(0.25);
    });
  });

  describe("shuffle mode", () => {
    it("shuffles context-aware preserving current song at index 0", () => {
      const ids = [1, 2, 3, 4, 5];
      usePlayer.getState().setQueue(ids);
      usePlayer.getState().play(3);

      expect(usePlayer.getState().currentSongId).toBe(3);
      expect(usePlayer.getState().queue).toEqual(ids);

      usePlayer.getState().toggleShuffle();

      const shuffled = usePlayer.getState().queue;
      expect(usePlayer.getState().isShuffle).toBe(true);
      expect(shuffled[0]).toBe(3);
      expect(shuffled).toHaveLength(5);
      expect(new Set(shuffled)).toEqual(new Set(ids));

      const stored = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) ?? "{}");
      expect(stored.isShuffle).toBe(true);
    });

    it("restores original queue order when shuffle is toggled off", () => {
      const ids = [10, 20, 30, 40];
      usePlayer.getState().setQueue(ids);
      usePlayer.getState().play(20);

      usePlayer.getState().toggleShuffle();
      expect(usePlayer.getState().isShuffle).toBe(true);
      expect(usePlayer.getState().queue[0]).toBe(20);

      usePlayer.getState().toggleShuffle();
      expect(usePlayer.getState().isShuffle).toBe(false);
      expect(usePlayer.getState().queue).toEqual(ids);

      const stored = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) ?? "{}");
      expect(stored.isShuffle).toBe(false);
    });

    it("shuffles all songs when no song is currently playing", () => {
      const ids = [100, 200, 300, 400];
      usePlayer.getState().setQueue(ids);

      usePlayer.getState().toggleShuffle();
      expect(usePlayer.getState().isShuffle).toBe(true);
      expect(usePlayer.getState().queue).toHaveLength(4);
      expect(new Set(usePlayer.getState().queue)).toEqual(new Set(ids));

      usePlayer.getState().toggleShuffle();
      expect(usePlayer.getState().queue).toEqual(ids);
    });

    it("shuffles queue on setQueue when shuffle is already active", () => {
      usePlayer.setState({ isShuffle: true, currentSongId: 2 });
      const ids = [1, 2, 3, 4];
      usePlayer.getState().setQueue(ids);

      expect(usePlayer.getState().queue[0]).toBe(2);
      expect(usePlayer.getState().originalQueue).toEqual(ids);

      usePlayer.getState().toggleShuffle();
      expect(usePlayer.getState().queue).toEqual(ids);
    });
  });

  describe("repeat modes", () => {
    it("cycles through off -> all -> one -> off", () => {
      expect(usePlayer.getState().repeatMode).toBe("off");

      usePlayer.getState().toggleRepeat();
      expect(usePlayer.getState().repeatMode).toBe("all");
      let stored = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) ?? "{}");
      expect(stored.repeatMode).toBe("all");

      usePlayer.getState().toggleRepeat();
      expect(usePlayer.getState().repeatMode).toBe("one");
      stored = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) ?? "{}");
      expect(stored.repeatMode).toBe("one");

      usePlayer.getState().toggleRepeat();
      expect(usePlayer.getState().repeatMode).toBe("off");
      stored = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) ?? "{}");
      expect(stored.repeatMode).toBe("off");
    });

    it("allows setting repeatMode directly", () => {
      usePlayer.getState().setRepeatMode("one");
      expect(usePlayer.getState().repeatMode).toBe("one");

      const stored = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) ?? "{}");
      expect(stored.repeatMode).toBe("one");
    });
  });

  describe("persistence helpers", () => {
    it("reads defaults when localStorage is empty", () => {
      const prefs = readStoredPreferences();
      expect(prefs).toEqual({
        volume: 1,
        isMuted: false,
        isShuffle: false,
        repeatMode: "off",
      });
    });

    it("recovers gracefully from corrupted JSON", () => {
      localStorage.setItem(PLAYER_STORAGE_KEY, "invalid-json{");
      const prefs = readStoredPreferences();
      expect(prefs).toEqual({
        volume: 1,
        isMuted: false,
        isShuffle: false,
        repeatMode: "off",
      });
    });

    it("sanitizes invalid stored values", () => {
      localStorage.setItem(
        PLAYER_STORAGE_KEY,
        JSON.stringify({
          volume: "loud",
          isMuted: "yes",
          isShuffle: null,
          repeatMode: "unknown-mode",
        }),
      );
      const prefs = readStoredPreferences();
      expect(prefs).toEqual({
        volume: 1,
        isMuted: false,
        isShuffle: false,
        repeatMode: "off",
      });
    });

    it("reads valid stored values", () => {
      writeStoredPreferences({
        volume: 0.4,
        isMuted: true,
        isShuffle: true,
        repeatMode: "all",
      });

      const prefs = readStoredPreferences();
      expect(prefs).toEqual({
        volume: 0.4,
        isMuted: true,
        isShuffle: true,
        repeatMode: "all",
      });
    });
  });
});
