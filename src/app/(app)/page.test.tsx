import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { addRecentlyPlayed } from "@/lib/recently-played";
import Home from "./page";

describe("Home", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders the greeting and Made For You section", () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <Home />
      </QueryClientProvider>,
    );
    expect(screen.getByText(/Good (morning|afternoon|evening)/)).toBeInTheDocument();
    expect(screen.getByText("Made For You")).toBeInTheDocument();
  });

  it("renders Recently Played when history exists", () => {
    addRecentlyPlayed({
      id: 1,
      title: "Come Together",
      artist: "The Beatles",
      album: "Abbey Road",
      duration: 258,
      color: "#1a1a2e",
    });

    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <Home />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Recently Played")).toBeInTheDocument();
  });
});
