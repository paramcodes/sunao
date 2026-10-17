import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueuePanel } from "./queue-panel";

const PANEL_ID = "queue-panel-content";

const queueRegion = () => document.getElementById(PANEL_ID);

describe("QueuePanel", () => {
  it("renders the now playing section with the toggle expanded", () => {
    render(<QueuePanel />);

    const button = screen.getByRole("button", { name: "Hide queue" });
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAttribute("aria-controls", PANEL_ID);
    expect(queueRegion()).not.toHaveAttribute("inert");
    expect(screen.getByText("Now playing")).toBeVisible();
  });

  it("collapses the queue when Hide queue is clicked", async () => {
    const user = userEvent.setup();
    render(<QueuePanel />);

    await user.click(screen.getByRole("button", { name: "Hide queue" }));

    const button = screen.getByRole("button", { name: "Show queue" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", PANEL_ID);
    expect(queueRegion()).toHaveAttribute("inert");
  });

  it("restores the queue when Show queue is clicked", async () => {
    const user = userEvent.setup();
    render(<QueuePanel />);

    await user.click(screen.getByRole("button", { name: "Hide queue" }));
    await user.click(screen.getByRole("button", { name: "Show queue" }));

    expect(screen.getByRole("button", { name: "Hide queue" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(queueRegion()).not.toHaveAttribute("inert");
    expect(screen.getByText("Now playing")).toBeVisible();
  });
});
