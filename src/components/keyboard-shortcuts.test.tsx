import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { usePlayer } from "@/stores/player";
import { KeyboardShortcuts } from "./keyboard-shortcuts";

const renderKeyboardShortcuts = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <KeyboardShortcuts />
      <input data-testid="search-input" />
      <textarea data-testid="bio-textarea" />
      <div data-testid="editable-div" contentEditable />
    </QueryClientProvider>,
  );
};

describe("KeyboardShortcuts", () => {
  beforeEach(() => {
    localStorage.clear();
    usePlayer.setState({
      currentSongId: 1,
      isPlaying: false,
      volume: 0.5,
      isMuted: false,
      queue: [1, 2, 3],
      originalQueue: [1, 2, 3],
    });
  });

  it("toggles play/pause on Space", () => {
    renderKeyboardShortcuts();

    fireEvent.keyDown(window, { code: "Space" });
    expect(usePlayer.getState().isPlaying).toBe(true);

    fireEvent.keyDown(window, { code: "Space" });
    expect(usePlayer.getState().isPlaying).toBe(false);
  });

  it("skips to next track on Shift+N or J", () => {
    renderKeyboardShortcuts();

    fireEvent.keyDown(window, { key: "N", shiftKey: true });
    expect(usePlayer.getState().currentSongId).toBe(2);

    fireEvent.keyDown(window, { key: "j" });
    expect(usePlayer.getState().currentSongId).toBe(3);
  });

  it("skips to previous track on Shift+P or K", () => {
    usePlayer.setState({ currentSongId: 3 });
    renderKeyboardShortcuts();

    fireEvent.keyDown(window, { key: "P", shiftKey: true });
    expect(usePlayer.getState().currentSongId).toBe(2);

    fireEvent.keyDown(window, { key: "k" });
    expect(usePlayer.getState().currentSongId).toBe(1);
  });

  it("adjusts volume with ArrowUp and ArrowDown by 0.05", () => {
    usePlayer.setState({ volume: 0.5 });
    renderKeyboardShortcuts();

    fireEvent.keyDown(window, { key: "ArrowUp" });
    expect(usePlayer.getState().volume).toBe(0.55);

    fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(usePlayer.getState().volume).toBe(0.5);
  });

  it("guards against inputs, textareas, and contentEditable", () => {
    const { getByTestId } = renderKeyboardShortcuts();
    const input = getByTestId("search-input");
    const textarea = getByTestId("bio-textarea");
    const editable = getByTestId("editable-div");

    // Space in input should not toggle play
    fireEvent.keyDown(input, { code: "Space" });
    expect(usePlayer.getState().isPlaying).toBe(false);

    // ArrowUp in input should not adjust volume
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(usePlayer.getState().volume).toBe(0.5);

    // J in textarea should not skip track
    fireEvent.keyDown(textarea, { key: "j" });
    expect(usePlayer.getState().currentSongId).toBe(1);

    // K in contentEditable should not skip track
    fireEvent.keyDown(editable, { key: "k" });
    expect(usePlayer.getState().currentSongId).toBe(1);
  });
});
