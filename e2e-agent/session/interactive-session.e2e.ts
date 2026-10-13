import { expect, unique } from "e2e";
import { test } from "../utils/cleanup";

test(
  "the agent launches an interactive session that reaches RUNNING",
  { session: "admin", timeout: 600_000 },
  async ({ app, agent, browser, screen, sessionsToCleanup }) => {
    const name = `e2e-agent-${Date.now()}`;
    sessionsToCleanup.push(name);

    await app.open("/session/start");
    // The form renders after the app shell; acting earlier trips the loop guard.
    await expect(screen.getByRole("textbox", "Session Name")).toBeVisible({
      timeout: 30_000,
    });

    await agent.act(
      'Choose the "Interactive" session type, enter {name} as the Session name, then press "Next"',
      { params: { name: unique(name) } },
    );
    await expect(screen.getByRole("button", /^Resource Group/)).toBeVisible({
      timeout: 15_000,
    });

    await agent.act(
      'Select {group} in the "Resource Group" field and {preset} in the "Resource Presets" field',
      { params: { group: "default", preset: "Minimum requirements" } },
    );
    await expect(screen.getByRole("button", /^Resource Presets/)).toHaveText(
      /Minimum requirements/,
    );

    await agent.act(
      'Press "Skip to review", press "Launch", and when a dialog says "No storage folder is mounted", press "Start"',
    );
    await expect(browser).toHaveURL(/\/session(\?|$)/, { timeout: 30_000 });

    const row = screen.getByRole("row").filter({ hasText: name });
    await expect(row).toBeVisible({ timeout: 60_000 });
    await expect(row.getByText("RUNNING")).toBeVisible({ timeout: 300_000 });
  },
);
