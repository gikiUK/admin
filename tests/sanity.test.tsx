import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Sanity", () => {
  it("renders the home page", () => {
    render(<Home />);
    expect(screen.getByText("Giki Admin")).toBeInTheDocument();
  });
});
