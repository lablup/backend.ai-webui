import { type Browser, test } from "@e2e-dev/web";
import { expect } from "e2e";
import {
  findNotInstalledEnvironment,
  isImageInstalled,
} from "../../utils/session-image";
import { overrideWebUISettings } from "../../utils/webui-settings";

// The first-use tours on the user menu cover the header and the side menu.
const seedToursSeen = (browser: Browser) =>
  browser.addInitScript(() => {
    for (const key of [
      "has_opened_tour_back_to_user_view",
      "has_opened_tour_back_to_admin_settings",
    ]) {
      window.localStorage.setItem(
        `backendaiwebui.settings.user.${key}`,
        "true",
      );
    }
  });

const clientConfig = (browser: Browser, key: string) =>
  browser
    .evaluate(
      (name: string) => (globalThis as any).backendaiclient?._config?.[name],
      key,
    )
    .catch(() => undefined);

// ported from: e2e/config/config.spec.ts › block list
test(
  "block list",
  { session: "admin", timeout: 480_000 },
  async ({ app, agent, screen, browser }) => {
    await overrideWebUISettings(browser, {
      menuBlocklist: ["start", "deployments", "session"],
    });
    await seedToursSeen(browser);

    const sideMenu = screen.getByRole("navigation", "Side navigation");
    const entries = {
      start: sideMenu.getByRole("link", "Start"),
      sessions: sideMenu.getByRole("link", /Sessions$/),
      deployments: sideMenu.getByRole("link", /Deployments$/),
    };
    const notFound = screen.getByRole("heading", /Page not Found/);

    await app.open("/start");
    await expect(sideMenu.getByRole("link", /Data$/)).toBeVisible({
      timeout: 30_000,
    });

    await agent.act(
      'Check that the side menu shows no "Start", "Sessions" or "Deployments" entry',
    );
    for (const entry of Object.values(entries)) {
      await expect(entry).toBeHidden();
    }
    await expect(sideMenu.getByRole("link", /Data$/)).toBeVisible();

    await agent.act(
      'Open the Start, Serving and Job pages by their addresses: go to /start, then /serving, then /job. Each is expected to show "Page not Found"; that is not a failure',
      { timeout: 300_000 },
    );
    // /job redirects to the Sessions page, which is blocked too.
    await expect(browser).toHaveURL(/\/(job|session)$/);
    await expect(notFound).toBeVisible({ timeout: 15_000 });
    for (const path of ["/start", "/serving"]) {
      await app.open(path);
      await expect(notFound).toBeVisible({ timeout: 15_000 });
    }

    await overrideWebUISettings(browser, { menuBlocklist: [] });
    await agent.act(
      'The menu blocklist is now empty: reload the page and check that the side menu lists "Sessions" and "Deployments" again. The side menu has no "Start" entry of its own; Start is the dashboard\'s Start cards',
    );
    await expect(entries.sessions).toBeVisible({ timeout: 15_000 });
    await expect(entries.deployments).toBeVisible({ timeout: 15_000 });
    // "start" now names the dashboard's Start cards, which come back too.
    await app.open("/start");
    await expect(
      screen.getByRole("button", "Start Session").first(),
    ).toBeVisible({ timeout: 30_000 });
    await expect(notFound).toBeHidden();
  },
);

// ported from: e2e/config/config.spec.ts › showNonInstalledImages: Allow users to select non-installed images when creating sessions
test(
  "showNonInstalledImages: Allow users to select non-installed images when creating sessions",
  { session: "admin", timeout: 600_000 },
  async ({ app, agent, screen, browser }) => {
    await overrideWebUISettings(browser, {
      menuBlocklist: [],
      showNonInstalledImages: true,
    });
    await seedToursSeen(browser);

    await app.open("/start");
    await expect(screen.getByTestId("user-dropdown-button")).toBeVisible({
      timeout: 30_000,
    });
    // The admin console's image list is read through the API instead.
    const { environment, image } = await findNotInstalledEnvironment(browser);
    const params = { environment };
    await expect.poll(() => isImageInstalled(browser, image)).toBe(false);
    await expect
      .poll(() => clientConfig(browser, "showNonInstalledImages"))
      .toBe(true);

    await agent.act(
      'Go to the Start page and press "Start Session" on "Start Interactive Session"',
    );
    await expect(browser).toHaveURL(/\/session\/start/, { timeout: 15_000 });
    await expect(screen.getByRole("textbox", /^Session Name\b/)).toBeVisible({
      timeout: 30_000,
    });

    await agent.act('Go to the "Environments & Resource" step');
    await expect(
      screen.getByText("Environments / Version").first(),
    ).toBeVisible({
      timeout: 15_000,
    });

    // The search matches the environment name; the full image name finds
    // nothing in the Astryx selector, installed or not.
    const environmentOption = screen
      .getByRole("option")
      .filter({ hasText: environment })
      .first();
    await agent.act(
      'Open the "Environments / Version" selector and type {environment} into its search',
      { params },
    );
    await expect(environmentOption).toBeVisible({ timeout: 15_000 });

    await overrideWebUISettings(browser, {
      menuBlocklist: [],
      showNonInstalledImages: false,
    });
    await app.open("/start");
    await expect
      .poll(() => clientConfig(browser, "showNonInstalledImages"), {
        timeout: 30_000,
      })
      .toBe(false);
    await expect(
      screen.getByRole("button", "Start Session").first(),
    ).toBeVisible({ timeout: 30_000 });

    await agent.act(
      'Press "Start Session" on "Start Interactive Session", go to the "Environments & Resource" step, open the "Environments / Version" selector and type {environment} into its search. The list may show "No results found"; that is an expected outcome, not a failure',
      { params },
    );
    await expect(
      screen.getByText("Environments / Version").first(),
    ).toBeVisible();
    await expect(
      screen.getByRole("combobox", "Search options", { visible: true }).last(),
    ).toHaveValue(environment);
    await expect(screen.getByText("No results found")).toBeVisible();
    await expect(environmentOption).toBeHidden();
  },
);
