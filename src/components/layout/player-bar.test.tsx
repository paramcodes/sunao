import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePlayer } from "@/stores/player";
import { PlayerBar } from "./player-bar";

const renderPlayerBar = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delay={0}>
        <PlayerBar />
      </TooltipProvider>
    </QueryClientProvider>,
  );
};

describe("PlayerBar", () => {
  beforeEach(() => {
    localStorage.clear();
    usePlayer.setState({
      currentSongId: 1,
      isPlaying: false,
      isBuffering: false,
      position: 0,
      duration: 180,
      speed: 1,
      queue: [1, 2, 3],
      originalQueue: [1, 2, 3],
      volume: 1,
      isMuted: false,
      isShuffle: false,
      repeatMode: "off",
    });
  });

  describe("volume and mute controls", () => {
    it("renders volume slider and mute button", () => {
      renderPlayerBar();

      const muteButton = screen.getByRole("button", { name: "Mute" });
      expect(muteButton).toBeInTheDocument();

      const volumeSlider = document.querySelector('input[aria-label="Volume"]');
      expect(volumeSlider).toBeInTheDocument();
      expect(volumeSlider).toHaveAttribute("aria-valuenow", "1");
    });

    it("toggles mute when mute button is clicked", async () => {
      const user = userEvent.setup();
      renderPlayerBar();

      const muteButton = screen.getByRole("button", { name: "Mute" });
      await user.click(muteButton);

      expect(usePlayer.getState().isMuted).toBe(true);
      expect(screen.getByRole("button", { name: "Unmute" })).toBeInTheDocument();

      const volumeSlider = document.querySelector('input[aria-label="Volume"]');
      expect(volumeSlider).toHaveAttribute("aria-valuenow", "0");

      await user.click(screen.getByRole("button", { name: "Unmute" }));
      expect(usePlayer.getState().isMuted).toBe(false);
      expect(screen.getByRole("button", { name: "Mute" })).toBeInTheDocument();
    });
  });

  describe("shuffle toggle button", () => {
    it("renders inactive by default and toggles on click", async () => {
      const user = userEvent.setup();
      renderPlayerBar();

      const shuffleButton = screen.getByRole("button", { name: "Enable shuffle" });
      expect(shuffleButton).toHaveAttribute("aria-pressed", "false");

      await user.click(shuffleButton);

      expect(usePlayer.getState().isShuffle).toBe(true);
      expect(screen.getByRole("button", { name: "Disable shuffle" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );

      await user.click(screen.getByRole("button", { name: "Disable shuffle" }));
      expect(usePlayer.getState().isShuffle).toBe(false);
      expect(screen.getByRole("button", { name: "Enable shuffle" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });
  });

  describe("repeat toggle button", () => {
    it("cycles through off -> all -> one -> off on click", async () => {
      const user = userEvent.setup();
      renderPlayerBar();

      const repeatButton = screen.getByRole("button", { name: "Repeat: off" });
      expect(repeatButton).toHaveAttribute("aria-pressed", "false");

      await user.click(repeatButton);
      expect(usePlayer.getState().repeatMode).toBe("all");
      expect(screen.getByRole("button", { name: "Repeat: all" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );

      await user.click(screen.getByRole("button", { name: "Repeat: all" }));
      expect(usePlayer.getState().repeatMode).toBe("one");
      expect(screen.getByRole("button", { name: "Repeat: one" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );

      await user.click(screen.getByRole("button", { name: "Repeat: one" }));
      expect(usePlayer.getState().repeatMode).toBe("off");
      expect(screen.getByRole("button", { name: "Repeat: off" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });
  });

  describe("transport buttons", () => {
    it("toggles play/pause", async () => {
      const user = userEvent.setup();
      renderPlayerBar();

      const playButton = screen.getByRole("button", { name: "Play" });
      await user.click(playButton);

      expect(usePlayer.getState().isPlaying).toBe(true);

      const pauseButton = screen.getByRole("button", { name: "Pause" });
      await user.click(pauseButton);

      expect(usePlayer.getState().isPlaying).toBe(false);
    });

    it("skips forward and backward", async () => {
      const user = userEvent.setup();
      renderPlayerBar();

      const nextButton = screen.getByRole("button", { name: "Next track" });
      await user.click(nextButton);
      expect(usePlayer.getState().currentSongId).toBe(2);

      const prevButton = screen.getByRole("button", { name: "Previous track" });
      await user.click(prevButton);
      expect(usePlayer.getState().currentSongId).toBe(1);
    });
  });
});
