import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders the greeting", () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <Home />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Good evening")).toBeInTheDocument();
  });
});
