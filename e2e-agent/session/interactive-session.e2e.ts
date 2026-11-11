import { expect, unique } from "e2e";
import { test } from "../utils/cleanup";
import { findRunnableImage } from "../utils/session-image";

const resourceGroup = "default";

test(
  "the agent launches an interactive session that reaches RUNNING",
  { session: "admin", timeout: 600_000 },
  async ({ app, agent, browser, screen, sessionsToCleanup }) => {
    const name = `e2e-agent-${Date.now()}`;
    sessionsToCleanup.push(name);

    // Seed the environment through the launcher's own `formValues` link: its
    // default is the first accelerator-dedicated image, which only GPU agents
    // have, so a session on it never runs in the CPU group used below.
    const image = await findRunnableImage(app, browser, resourceGroup);
    await app.open(
      `/session/start?formValues=${encodeURIComponent(
        JSON.stringify({ environments: image }),
      )}`,
    );
    // The form renders after the app shell; acting earlier trips the loop guard.
    // Two labels point at this input: the form item's visible "Session Name
    // (optional)" and the control's own hidden "Session Name". The browser
    // joins them into one accessible name, so match the name's start.
    await expect(screen.getByRole("textbox", /^Session Name\b/)).toBeVisible({
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
      { params: { group: resourceGroup, preset: "Minimum requirements" } },
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
