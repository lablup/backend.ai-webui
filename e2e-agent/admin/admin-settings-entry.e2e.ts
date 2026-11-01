import type { Browser } from "@e2e-dev/web";
import { expect } from "e2e";
import { test } from "../utils/cleanup";
import { currentProjectName } from "../utils/project";

const TOUR_SETTINGS = [
  "has_opened_tour_back_to_user_view",
  "has_opened_tour_back_to_admin_settings",
];
const adminUrl = /\/admin\//;
const userViewUrl = /^(?!.*\/admin(\/|$|\?))/;

const userSetting = (browser: Browser, name: string) =>
  browser
    .evaluate(
      (key: string) => window.localStorage.getItem(key),
      `backendaiwebui.settings.user.${name}`,
    )
    .catch(() => null);

// The first-use tours cover the header for a superadmin in a fresh context.
const skipAdminViewSwitchTours = (browser: Browser) =>
  browser.addInitScript((names: string[]) => {
    for (const name of names) {
      window.localStorage.setItem(
        `backendaiwebui.settings.user.${name}`,
        "true",
      );
    }
  }, TOUR_SETTINGS);

test(
  "the superadmin lands on the admin settings and follows the first-use tour back to the user view",
  { session: "admin", timeout: 300_000 },
  async ({ app, agent, browser, screen }) => {
    const intro = screen.getByRole("dialog", "The superadmin view has changed");
    const userViewTour = screen.getByRole(
      "dialog",
      "Switching to the user view",
    );
    const adminSettingsTour = screen.getByRole(
      "dialog",
      "Returning to the admin settings",
    );
    const switchToUser = screen.getByRole("menuitem", "Switch to User Console");

    await app.open("/");
    await expect(browser).toHaveURL(adminUrl, { timeout: 30_000 });
    await expect(intro).toBeVisible({ timeout: 30_000 });

    await agent.act(
      'Read the "The superadmin view has changed" dialog and press "Next"',
    );
    await expect(intro).toBeHidden({ timeout: 15_000 });
    await expect(userViewTour).toBeVisible({ timeout: 15_000 });

    await agent.act(
      'Read the "Switching to the user view" tour and press "Done"',
    );
    await expect(userViewTour).toBeHidden({ timeout: 15_000 });
    await expect
      .poll(() => userSetting(browser, TOUR_SETTINGS[0]), { timeout: 15_000 })
      .toBe("true");

    await agent.act("Open the user menu in the header");
    await expect(switchToUser).toBeVisible({ timeout: 15_000 });

    await agent.act('Choose "Switch to User Console"');
    await expect(browser).toHaveURL(userViewUrl, { timeout: 15_000 });
    await expect(adminSettingsTour).toBeVisible({ timeout: 15_000 });

    await agent.act(
      'Read the "Returning to the admin settings" tour and press "Done"',
    );
    await expect(adminSettingsTour).toBeHidden({ timeout: 15_000 });
    await expect
      .poll(() => userSetting(browser, TOUR_SETTINGS[1]), { timeout: 15_000 })
      .toBe("true");
  },
);

test(
  "the superadmin opens the admin settings from the header user menu",
  { session: "admin", timeout: 300_000 },
  async ({ app, agent, browser, screen }) => {
    const switchToAdmin = screen.getByRole(
      "menuitem",
      "Switch to Admin Console",
    );

    await skipAdminViewSwitchTours(browser);
    await app.open("/start");
    await expect(browser).toHaveURL(/\/start/, { timeout: 30_000 });
    await expect(screen.getByTestId("user-dropdown-button")).toBeVisible({
      timeout: 30_000,
    });

    await agent.act("Open the user menu in the header");
    await expect(switchToAdmin).toBeVisible({ timeout: 15_000 });

    await agent.act('Choose "Switch to Admin Console"');
    await expect(browser).toHaveURL(adminUrl, { timeout: 15_000 });
    await expect(switchToAdmin).toBeHidden({ timeout: 15_000 });
    await expect(screen.getByRole("link", "Projects")).toBeVisible({
      timeout: 15_000,
    });
  },
);

test(
  "the superadmin returns to the user view from the header user menu",
  { session: "admin", timeout: 300_000 },
  async ({ app, agent, browser, screen }) => {
    const switchToAdmin = screen.getByRole(
      "menuitem",
      "Switch to Admin Console",
    );
    const switchToUser = screen.getByRole("menuitem", "Switch to User Console");

    await skipAdminViewSwitchTours(browser);
    await app.open("/start");
    await expect(browser).toHaveURL(/\/start/, { timeout: 30_000 });
    await expect(screen.getByTestId("user-dropdown-button")).toBeVisible({
      timeout: 30_000,
    });

    await agent.act("Open the user menu in the header");
    await expect(switchToAdmin).toBeVisible({ timeout: 15_000 });

    await agent.act('Choose "Switch to Admin Console"');
    await expect(browser).toHaveURL(adminUrl, { timeout: 15_000 });
    await expect(switchToAdmin).toBeHidden({ timeout: 15_000 });

    await agent.act("Open the user menu in the header");
    await expect(switchToUser).toBeVisible({ timeout: 15_000 });

    await agent.act('Choose "Switch to User Console"');
    await expect(browser).toHaveURL(/\/start/, { timeout: 15_000 });
    await expect(switchToUser).toBeHidden({ timeout: 15_000 });
    await expect(screen.getByTestId("page-start")).toBeVisible({
      timeout: 15_000,
    });
  },
);

test(
  "a project admin opens the project settings from the side menu",
  { session: "admin", timeout: 300_000 },
  async ({ app, agent, browser, screen }) => {
    const project = "model-store";
    const projectStartUrl = new RegExp(`/project/${project}/start/?($|\\?)`);
    const projectSettings = screen.getByRole("link", "Project Settings");
    const goBack = screen.getByRole("button", "Go Back");

    await skipAdminViewSwitchTours(browser);
    await app.open("/start");
    const selector = screen.getByRole("button", "Select Project");
    await expect(selector).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() => currentProjectName(browser), { timeout: 30_000 })
      .toBeTruthy();
    // Starting on another project keeps the switch below observable.
    expect(await currentProjectName(browser)).not.toBe(project);

    await agent.act(
      'Open the "Select Project" selector in the header and choose the {project} project marked "Project Admin"',
      { params: { project } },
    );
    await expect(browser).toHaveURL(projectStartUrl, {
      timeout: 15_000,
    });
    await expect(selector).toHaveText(new RegExp(project));
    await expect
      .poll(() => currentProjectName(browser), { timeout: 15_000 })
      .toBe(project);

    await agent.act('Open "Project Settings" from the side menu');
    await expect(browser).toHaveURL(new RegExp(`/project/${project}/admin/`), {
      timeout: 15_000,
    });
    await expect(goBack).toBeVisible({ timeout: 15_000 });

    await agent.act('Press "Go Back" next to the "Project Settings" heading');
    await expect(browser).toHaveURL(projectStartUrl, {
      timeout: 15_000,
    });
    await expect(goBack).toBeHidden({ timeout: 15_000 });
    await expect(projectSettings).toBeVisible({ timeout: 15_000 });
  },
);
