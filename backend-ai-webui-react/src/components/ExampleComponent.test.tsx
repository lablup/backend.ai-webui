import React from "react";
import { render, screen } from "@testing-library/react";
import SampleComponent from "./ExampleComponent";

test("renders learn react link", () => {
  render(<SampleComponent />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
