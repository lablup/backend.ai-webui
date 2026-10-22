import { expect } from "e2e";
import { test } from "../utils/cleanup";
import { currentProjectName, personalProjectName } from "../utils/project";

test(
  "the user switches to their personal project from the header project selector",
  { session: "admin", timeout: 180_000 },
  async ({ app, agent, browser, screen }) => {
    await app.open("/data");
    const selector = screen.getByRole("button", "Select Project");
    await expect(selector).toBeVisible({ timeout: 30_000 });

    let personal: string | null = null;
    await expect
      .poll(
        async () => {
          personal = await personalProjectName(browser);
          return personal;
        },
        { timeout: 30_000 },
      )
      .toBeTruthy();
    const personalName = personal as unknown as string;
    await expect.poll(() => currentProjectName(browser)).not.toBe(personalName);

    await agent.act('Open the "Select Project" selector in the header');
    const personalGroup = screen
      .getByRole("listbox", "Select Project")
      .getByRole("group", "Personal");
    await expect(personalGroup).toBeVisible({ timeout: 15_000 });
    await expect(personalGroup.getByRole("option", personalName)).toBeVisible();

    await agent.act(
      'In the open project list, choose the {project} option listed under the "Personal" group',
      { params: { project: personalName } },
    );
    await expect(browser).toHaveURL(
      new RegExp(`/project/${personalName}/data/?($|\\?)`),
      { timeout: 15_000 },
    );
    await expect(selector).toHaveText(new RegExp(personalName));
    await expect
      .poll(() => currentProjectName(browser), { timeout: 15_000 })
      .toBe(personalName);

    await agent.act("Reload the page");
    await expect(browser).toHaveURL(
      new RegExp(`/project/${personalName}/data/?($|\\?)`),
      { timeout: 15_000 },
    );
    await expect(selector).toHaveText(new RegExp(personalName), {
      timeout: 30_000,
    });
    await expect
      .poll(() => currentProjectName(browser), { timeout: 30_000 })
      .toBe(personalName);
  },
);
