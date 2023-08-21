import { render, screen } from "@testing-library/react";
import Flex from "./Flex";

describe("Flex", () => {
  test("default render", async () => {
    const { baseElement } = render(<Flex />);
    expect(baseElement).toMatchSnapshot();
  });
  test("render with custom props", async () => {
    const { baseElement } = render(
      <Flex
        direction="column"
        wrap="wrap-reverse"
        justify="center"
        align="start"
        gap="sm"
        style={{ backgroundColor: "blue" }}
      />
    );
    expect(baseElement).toMatchSnapshot();
  });

  test("render with children", async () => {
    const { baseElement } = render(
      <Flex>
        <div data-testid="firstChildComponent">
          <h1> First Child </h1>
          <div data-testid="nestedChildComponent">
            <h1> Nested Child </h1>
          </div>
        </div>
        <div data-testid="secondChildComponent">
          <h1> Second Child </h1>
        </div>
      </Flex>
    );
    expect(screen.getByTestId("firstChildComponent")).toBeInTheDocument();
    expect(screen.getByTestId("secondChildComponent")).toBeInTheDocument();
    expect(screen.getByTestId("nestedChildComponent")).toBeInTheDocument();

    expect(baseElement).toMatchSnapshot();
  });
});
