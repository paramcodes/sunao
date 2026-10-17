import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { getPlaceholderLyrics, LyricsPanel } from "@/components/player/lyrics-panel";
import { usePlayer } from "@/stores/player";
import type { Song } from "@/types";

const mockSong: Song = {
  id: 1,
  title: "Come Together",
  artist: "The Beatles",
  album: "Abbey Road",
  duration: 258,
  color: "#1a1a2e",
};

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe("LyricsPanel", () => {
  beforeEach(() => {
    usePlayer.setState({
      currentSongId: 1,
      position: 0,
      isPlaying: false,
    });
  });

  it("provides placeholder synchronized lyrics for songs", () => {
    const lyrics = getPlaceholderLyrics(mockSong);
    expect(lyrics.length).toBeGreaterThan(0);
    expect(lyrics[0]).toHaveProperty("time");
    expect(lyrics[0]).toHaveProperty("text");
  });

  it("renders lines with the active line highlighted based on song position", () => {
    usePlayer.setState({ position: 5 });
    renderWithClient(<LyricsPanel song={mockSong} />);

    // At 5 seconds into Come Together, second line ("He come groovin' up slowly", time 4) should be active
    const activeLine = screen.getByText("He come groovin' up slowly");
    expect(activeLine).toHaveClass("font-bold");
  });

  it("seeks to timestamp when a lyric line is clicked", async () => {
    const user = userEvent.setup();
    renderWithClient(<LyricsPanel song={mockSong} />);

    const targetLine = screen.getByText("He got joo joo eyeball"); // time 8
    await user.click(targetLine);

    expect(usePlayer.getState().position).toBe(8);
  });

  it("renders empty state when no song is provided or playing", () => {
    usePlayer.setState({ currentSongId: null });
    renderWithClient(<LyricsPanel song={null} />);

    expect(screen.getByText("Select a song to see lyrics")).toBeInTheDocument();
  });
});
