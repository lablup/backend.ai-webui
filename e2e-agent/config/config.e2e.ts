import { type Browser, test } from "@e2e-dev/web";
import { expect, unique } from "e2e";
import {
  type ConfigTomlOverrides,
  overrideConfigToml,
} from "../utils/config-toml";
import {
  findNotInstalledEnvironment,
  isImageInstalled,
} from "../utils/session-image";

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
    let blocklist = "start,deployments,session";
    const overrides = (): ConfigTomlOverrides => ({ menu: { blocklist } });
    await overrideConfigToml(browser, overrides);
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

    blocklist = "";
    await agent.act(
      'The menu blocklist is now empty: reload the page and check that the side menu lists "Start", "Sessions" and "Deployments" again',
    );
    for (const entry of Object.values(entries)) {
      await expect(entry).toBeVisible({ timeout: 15_000 });
    }
  },
);

// ported from: e2e/config/config.spec.ts › showNonInstalledImages: Allow users to select non-installed images when creating sessions
test(
  "showNonInstalledImages: Allow users to select non-installed images when creating sessions",
  { session: "admin", timeout: 600_000 },
  async ({ app, agent, screen, browser }) => {
    let showNonInstalledImages = true;
    const overrides = (): ConfigTomlOverrides => ({
      menu: { blocklist: "" },
      environments: { showNonInstalledImages },
    });
    await overrideConfigToml(browser, overrides);
    await seedToursSeen(browser);

    const userMenu = screen.getByTestId("user-dropdown-button");
    await app.open("/start");
    await expect(userMenu).toBeVisible({ timeout: 30_000 });
    const { environment, image, imageKeyword } =
      await findNotInstalledEnvironment(browser);
    const params = { image: unique(image), imageKeyword, environment };
    await expect
      .poll(() => clientConfig(browser, "showNonInstalledImages"))
      .toBe(true);

    await agent.act("Open the user menu in the header");
    const toAdmin = screen.getByRole("menuitem", "Switch to Admin Console");
    await expect(toAdmin).toBeVisible();

    await agent.act('Choose "Switch to Admin Console"');
    await expect(browser).toHaveURL(/\/admin\//, { timeout: 15_000 });
    await expect(screen.getByText("Admin Settings").first()).toBeVisible();

    await agent.act('Open "Environments" from the side menu');
    await expect(browser).toHaveURL(/\/admin\/environment/, {
      timeout: 15_000,
    });
    await expect(screen.getByRole("button", "Images")).toBeVisible();

    await agent.act(
      'In the "Images" tab, find the image {image}, which is not installed: open "Search filters", choose the "Image" field, enter {imageKeyword} as the value and apply the filter, then check that the {image} row shows no "installed" badge in its Status column',
      { params, timeout: 240_000 },
    );
    const row = screen.getByRole("row").filter({ hasText: image });
    await expect(row).toBeVisible({ timeout: 15_000 });
    await expect(row.getByText(/^installed$/i)).toBeHidden();
    await expect.poll(() => isImageInstalled(browser, image)).toBe(false);

    await agent.act(
      'Go to the Start page and press "Start Session" on "Start Interactive Session"',
    );
    await expect(browser).toHaveURL(/\/session\/start/, { timeout: 15_000 });
    await expect(screen.getByRole("textbox", /^Session Name\b/)).toBeVisible({
      timeout: 30_000,
    });

    await agent.act('Go to the "Environments & Resource" step');
    await expect(screen.getByText("Environments / Version")).toBeVisible({
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

    showNonInstalledImages = false;
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
    await expect(screen.getByText("Environments / Version")).toBeVisible();
    await expect(
      screen.getByRole("combobox", "Search options", { visible: true }).last(),
    ).toHaveValue(environment);
    await expect(screen.getByText("No results found")).toBeVisible();
    await expect(environmentOption).toBeHidden();
  },
);
