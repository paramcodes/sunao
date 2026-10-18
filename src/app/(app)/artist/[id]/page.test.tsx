import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { usePlayer } from "@/stores/player";
import ArtistDetailPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
  }),
}));

describe("ArtistDetailPage", () => {
  it("renders bundled artist, top tracks, and discography", async () => {
    const user = userEvent.setup();
    render(<ArtistDetailPage params={{ id: "the-beatles" }} />);

    expect(await screen.findByRole("heading", { name: "The Beatles" })).toBeInTheDocument();
    expect(screen.getByText("Come Together")).toBeInTheDocument();
    expect(screen.getAllByText("Abbey Road")[0]).toBeInTheDocument();

    const playBtn = screen.getByRole("button", { name: /^Play$/i });
    await user.click(playBtn);

    expect(usePlayer.getState().currentSongId).toBe(1);
    expect(usePlayer.getState().isPlaying).toBe(true);
  });
});
