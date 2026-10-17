import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { usePlayer } from "@/stores/player";
import AlbumDetailPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
  }),
}));

describe("AlbumDetailPage", () => {
  it("renders bundled album and tracklist and supports play all", async () => {
    const user = userEvent.setup();
    render(<AlbumDetailPage params={{ id: "a1" }} />);

    expect(await screen.findByRole("heading", { name: "Abbey Road" })).toBeInTheDocument();
    expect(screen.getAllByText("The Beatles")[0]).toBeInTheDocument();
    expect(screen.getByText("Come Together")).toBeInTheDocument();

    const playAll = screen.getByRole("button", { name: /Play all/i });
    await user.click(playAll);

    expect(usePlayer.getState().currentSongId).toBe(1);
    expect(usePlayer.getState().isPlaying).toBe(true);
  });
});
