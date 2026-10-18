import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAudio } from "@/hooks/use-audio";
import { usePlayer } from "@/stores/player";

vi.mock("@/lib/itunes", () => ({
  fetchPreviewUrl: vi.fn().mockResolvedValue("/audio/sample.mp3"),
}));

describe("useAudio", () => {
  let mockAudioInstance: MockAudio;
  let listeners: Record<string, ((event: Event) => void)[]>;

  class MockAudio {
    src = "";
    currentTime = 0;
    duration = 200;
    volume = 1;
    muted = false;
    playbackRate = 1;
    play = vi.fn().mockResolvedValue(undefined);
    pause = vi.fn();
    load = vi.fn();
    addEventListener = vi.fn((event: string, handler: (e: Event) => void) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(handler);
    });
    removeEventListener = vi.fn((event: string, handler: (e: Event) => void) => {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter((h) => h !== handler);
    });
    dispatchEvent = (event: Event) => {
      const handlers = listeners[event.type] || [];
      for (const h of handlers) h(event);
      return true;
    };

    constructor() {
      mockAudioInstance = this;
    }
  }

  beforeEach(() => {
    listeners = {};
    vi.stubGlobal("Audio", MockAudio);

    usePlayer.setState({
      currentSongId: 1,
      isPlaying: true,
      position: 10,
      volume: 0.7,
      isMuted: false,
      repeatMode: "off",
      queue: [1, 2, 3],
      originalQueue: [1, 2, 3],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const renderAudioHook = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return renderHook(() => useAudio(), {
      wrapper: ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children),
    });
  };

  it("syncs volume and isMuted to audio element", () => {
    renderAudioHook();

    expect(mockAudioInstance.volume).toBe(0.7);
    expect(mockAudioInstance.muted).toBe(false);

    act(() => {
      usePlayer.getState().setVolume(0.3);
    });
    expect(mockAudioInstance.volume).toBe(0.3);

    act(() => {
      usePlayer.getState().toggleMute();
    });
    expect(mockAudioInstance.muted).toBe(true);
  });

  it("advances to next song on ended when repeatMode is off and not at end", () => {
    renderAudioHook();

    act(() => {
      mockAudioInstance.dispatchEvent(new Event("ended"));
    });

    expect(usePlayer.getState().currentSongId).toBe(2);
    expect(usePlayer.getState().isPlaying).toBe(true);
  });

  it("stops playing on ended when repeatMode is off and at end of queue", () => {
    usePlayer.setState({ currentSongId: 3 });
    renderAudioHook();

    act(() => {
      mockAudioInstance.dispatchEvent(new Event("ended"));
    });

    expect(usePlayer.getState().isPlaying).toBe(false);
    expect(mockAudioInstance.pause).toHaveBeenCalled();
  });

  it("wraps around to start of queue on ended when repeatMode is all", () => {
    usePlayer.setState({ currentSongId: 3, repeatMode: "all" });
    renderAudioHook();

    act(() => {
      mockAudioInstance.dispatchEvent(new Event("ended"));
    });

    expect(usePlayer.getState().currentSongId).toBe(1);
    expect(usePlayer.getState().isPlaying).toBe(true);
  });

  it("replays the current song from 0 on ended when repeatMode is one", () => {
    usePlayer.setState({ currentSongId: 2, repeatMode: "one" });
    renderAudioHook();

    mockAudioInstance.currentTime = 200;
    act(() => {
      mockAudioInstance.dispatchEvent(new Event("ended"));
    });

    expect(usePlayer.getState().currentSongId).toBe(2);
    expect(mockAudioInstance.currentTime).toBe(0);
    expect(mockAudioInstance.play).toHaveBeenCalled();
    expect(usePlayer.getState().position).toBe(0);
  });
});
