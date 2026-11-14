import { expect } from "e2e";
import { skipAdminViewSwitchTours } from "../../utils/admin-view-tours";
import { test } from "../../utils/cleanup";
import { currentProjectName } from "../../utils/project";

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
    await expect(browser).toHaveURL(projectDashboardUrl, {
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
    await expect(browser).toHaveURL(projectDashboardUrl, {
      timeout: 15_000,
    });
    await expect(goBack).toBeHidden({ timeout: 15_000 });
    await expect(projectSettings).toBeVisible({ timeout: 15_000 });
  },
);
