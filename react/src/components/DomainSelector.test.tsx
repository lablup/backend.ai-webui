import { render, screen, act, waitFor } from "@testing-library/react";
import React, { Suspense } from "react";
import DomainSelector from "./DomainSelector";
import userEvent from "@testing-library/user-event";
import {
  MockEnvironment,
  createMockEnvironment,
  MockPayloadGenerator,
} from "relay-test-utils";
import { RelayEnvironmentProvider } from "react-relay";

jest.mock("react-i18next", () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
  initReactI18next: {
    type: "3rdParty",
    init: () => {},
  },
}));

describe("DomainSelect", () => {
  test("default render", async () => {
    const environment = createMockEnvironment();
    const { getByText, asFragment } = render(
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback="loading...">
          <DomainSelector title="hello" placeholder="Please select domain" />
        </Suspense>
      </RelayEnvironmentProvider>
    );

    expect(getByText("loading...")).toBeInTheDocument();

    act(() => {
      environment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, {
          String() {
            return "abcd";
          },
        })
      );
    });

    expect(await screen.findByText("Please select domain")).toBeInTheDocument();
    await userEvent.click(await screen.findByRole("combobox"));
    expect(screen.getAllByText("abcd")[0]).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });
});
