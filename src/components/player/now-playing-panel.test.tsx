import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { NowPlayingPanel } from "@/components/player/now-playing-panel";
import { usePlayer } from "@/stores/player";

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe("NowPlayingPanel", () => {
  beforeEach(() => {
    usePlayer.setState({
      currentSongId: 1,
      isNowPlayingOpen: false,
      isPlaying: false,
      position: 0,
      duration: 258,
    });
  });

  it("is hidden when isNowPlayingOpen is false", () => {
    renderWithClient(<NowPlayingPanel />);
    expect(screen.queryByRole("dialog", { name: "Now playing" })).not.toBeInTheDocument();
  });

  it("renders artwork, track info, seek controls, transport controls, and queue link when open", () => {
    usePlayer.setState({ isNowPlayingOpen: true });
    renderWithClient(<NowPlayingPanel />);

    expect(screen.getByRole("dialog", { name: "Now playing" })).toBeInTheDocument();
    expect(screen.getByText("Come Together")).toBeInTheDocument();
    expect(screen.getByText("The Beatles")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close now playing" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open queue drawer" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous track" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next track" })).toBeInTheDocument();
  });

  it("returns focus to trigger element when closed", async () => {
    const user = userEvent.setup();

    // Create trigger button in document
    const trigger = document.createElement("button");
    trigger.id = "now-playing-trigger";
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    // Open panel
    usePlayer.setState({ isNowPlayingOpen: true });
    renderWithClient(<NowPlayingPanel />);

    const closeBtn = screen.getByRole("button", { name: "Close now playing" });
    await user.click(closeBtn);

    expect(usePlayer.getState().isNowPlayingOpen).toBe(false);
    expect(document.activeElement).toBe(trigger);

    document.body.removeChild(trigger);
  });

  it("toggles between album cover and lyrics view", async () => {
    const user = userEvent.setup();
    usePlayer.setState({ isNowPlayingOpen: true });
    renderWithClient(<NowPlayingPanel />);

    const lyricsTab = screen.getByRole("button", { name: "Lyrics" });
    await user.click(lyricsTab);

    expect(screen.getByRole("region", { name: "Lyrics" })).toBeInTheDocument();
    expect(screen.getByText("Here come old flat top")).toBeInTheDocument();
  });
});
