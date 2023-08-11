import { render, screen } from "@testing-library/react";
import Flex from "./Flex";
import renderer from "react-test-renderer";

describe("Flex", () => {
  test("default render", async () => {
    const flex = renderer.create(<Flex />);
    expect(flex.toJSON()).toMatchSnapshot();
  });

  test("render with custom props", async () => {
    const customFlex = renderer.create(
      <Flex
        direction="column"
        wrap="wrap-reverse"
        justify="center"
        align="start"
        gap="sm"
        style={{ backgroundColor: "blue" }}
      />
    );
    expect(customFlex.toJSON()).toMatchSnapshot();
  });
});
