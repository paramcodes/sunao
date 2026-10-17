import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addRecentSearch } from "@/lib/recent-searches";
import SearchPage from "./page";

describe("SearchPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  const renderSearch = () =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SearchPage />
      </QueryClientProvider>,
    );

  it("renders search input and category tabs", () => {
    renderSearch();

    expect(screen.getByPlaceholderText("What do you want to listen to?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Songs" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Albums" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Artists" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Playlists" })).toBeInTheDocument();
  });

  it("displays recent searches and supports click-to-search and clear", async () => {
    const user = userEvent.setup();
    addRecentSearch("The Beatles");
    renderSearch();

    expect(screen.getByText("Recent searches")).toBeInTheDocument();
    const recentItem = screen.getByText("The Beatles");
    expect(recentItem).toBeInTheDocument();

    await user.click(recentItem);
    const input = screen.getByPlaceholderText("What do you want to listen to?");
    expect(input).toHaveValue("The Beatles");

    const clearQuery = screen.getByRole("button", { name: "Clear query" });
    await user.click(clearQuery);
    expect(input).toHaveValue("");

    const clearAll = screen.getByRole("button", { name: "Clear all" });
    await user.click(clearAll);
    expect(screen.queryByText("Recent searches")).not.toBeInTheDocument();
  });
});
