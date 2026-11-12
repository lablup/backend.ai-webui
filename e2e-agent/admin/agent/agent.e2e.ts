import { type Browser, test } from "@e2e-dev/web";
import { expect } from "e2e";

const aliveAgentCount = (browser: Browser) =>
  browser
    .evaluate(async () => {
      const res = await (globalThis as any).backendaiclient.agent.list(
        "ALIVE",
        ["id"],
      );
      return (res?.agents ?? []).length as number;
    })
    .catch(() => -1);

// ported from: e2e/agent/agent.spec.ts › should have at least one connected agent
test(
  "should have at least one connected agent",
  { session: "admin", timeout: 300_000 },
  async ({ app, agent, browser, screen }) => {
    await app.open("/start");
    await expect(screen.getByTestId("user-dropdown-button")).toBeVisible({
      timeout: 30_000,
    });

    await agent.act(
      "Close the tour dialog if one is open, then open the user menu in the header",
    );
    await expect(
      screen.getByRole("menuitem", "Switch to Admin Console"),
    ).toBeVisible({ timeout: 15_000 });

    await agent.act(
      'Choose "Switch to Admin Console", then close the "The superadmin view has changed" dialog if it appears',
    );
    await expect(browser).toHaveURL(/\/admin\//, { timeout: 30_000 });
    await expect(
      screen
        .getByRole("navigation", "Side navigation")
        .getByRole("link", "Resources"),
    ).toBeVisible({ timeout: 15_000 });

    await agent.act('Open "Resources" from the side menu');
    await expect(browser).toHaveURL(/\/admin\/agent/, { timeout: 30_000 });
    await expect(screen.getByTestId("page-agent")).toBeVisible({
      timeout: 15_000,
    });

    await agent.act('Open the "Agent" tab');
    await expect(
      screen.getByRole("navigation", "Tabs").getByRole("button", "Agent"),
    ).toHaveAttribute("aria-current", "true", { timeout: 15_000 });

    await agent.act('Choose the "Connected" filter');
    await expect(screen.getByRole("radio", "Connected")).toBeChecked({
      timeout: 15_000,
    });
    await expect(
      screen
        .getByTestId("agent-list")
        .getByRole("row")
        .filter({
          hasText: "tcp://",
        })
        .first(),
    ).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() => aliveAgentCount(browser), { timeout: 30_000 })
      .toBeGreaterThan(0);
  },
);
