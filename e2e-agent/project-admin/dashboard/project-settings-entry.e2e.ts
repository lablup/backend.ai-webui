import { expect } from "e2e";
import { skipAdminViewSwitchTours } from "../../utils/admin-view-tours";
import { test } from "../../utils/cleanup";
import { currentProjectName, personalProjectName } from "../../utils/project";

test(
  "a project admin opens the project settings from the side menu",
  { session: "admin", timeout: 300_000 },
  async ({ app, agent, browser, screen }) => {
    const project = "model-store";
    const projectDashboardUrl = new RegExp(
      `/project/${project}/dashboard/?($|\\?)`,
    );
    const projectSettings = screen.getByRole("link", "Project Settings");
    const goBack = screen.getByRole("button", "Go Back");

    await skipAdminViewSwitchTours(browser);
    await app.open("/start");
    await expect
      .poll(() => currentProjectName(browser), { timeout: 30_000 })
      .toBeTruthy();
    const startName = (await currentProjectName(browser)) as string;
    // The selector's accessible name is its label followed by the project it
    // shows; the personal project shows as "My Project".
    const selectorShowing = (shown: string) =>
      screen.getByRole("button", `Select Project ${shown}`);
    const startShown =
      startName === (await personalProjectName(browser))
        ? "My Project"
        : startName;
    await expect(selectorShowing(startShown)).toBeVisible({ timeout: 30_000 });
    // Starting on another project keeps the switch below observable.
    expect(await currentProjectName(browser)).not.toBe(project);

    await agent.act(
      'Open the "Select Project" selector in the header and choose the {project} project marked "Project Admin"',
      { params: { project } },
    );
    await expect(browser).toHaveURL(projectDashboardUrl, {
      timeout: 15_000,
    });
    await expect(selectorShowing(project)).toHaveText(new RegExp(project));
    await expect
      .poll(() => currentProjectName(browser), { timeout: 15_000 })
      .toBe(project);

    await agent.act('Open "Project Settings" from the side menu');
    await expect(browser).toHaveURL(new RegExp(`/project/${project}/admin/`), {
      timeout: 15_000,
    });
    await expect(goBack).toBeVisible({ timeout: 15_000 });

    await agent.act('Press "Go Back" next to the "Project Settings" heading');
    await expect(browser).toHaveURL(projectDashboardUrl, {
      timeout: 15_000,
    });
    await expect(goBack).toBeHidden({ timeout: 15_000 });
    await expect(projectSettings).toBeVisible({ timeout: 15_000 });
  },
);
