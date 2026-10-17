import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders the greeting", () => {
    render(<Home />);
    expect(screen.getByText("Good evening")).toBeInTheDocument();
  });
});
