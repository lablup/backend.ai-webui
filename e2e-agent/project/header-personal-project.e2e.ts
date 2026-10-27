import { test } from "@e2e-dev/web";
import { expect } from "e2e";
import { currentProjectName, personalProjectName } from "../utils/project";

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test(
  "the user switches to their personal project from the header project selector",
  { session: "admin", timeout: 180_000 },
  async ({ app, agent, browser, screen }) => {
    await app.open("/data");
    const selector = screen.getByRole("button", "Select Project");
    await expect(selector).toBeVisible({ timeout: 30_000 });

    await expect
      .poll(() => personalProjectName(browser), { timeout: 30_000 })
      .toBeTruthy();
    const personalName = (await personalProjectName(browser)) as string;
    const name = escapeRegExp(personalName);
    const encoded = escapeRegExp(encodeURIComponent(personalName));
    const projectUrl = new RegExp(
      `/project/(${name}|${encoded})/data/?($|\\?)`,
    );
    const selectedText = new RegExp(`(^|[^\\w.@+-])${name}($|[^\\w.@+-])`);
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
    await expect(browser).toHaveURL(projectUrl, { timeout: 15_000 });
    await expect(selector).toHaveText(selectedText);
    await expect
      .poll(() => currentProjectName(browser), { timeout: 15_000 })
      .toBe(personalName);

    await agent.act("Reload the page");
    await expect(browser).toHaveURL(projectUrl, { timeout: 15_000 });
    await expect(selector).toHaveText(selectedText, { timeout: 30_000 });
    await expect
      .poll(() => currentProjectName(browser), { timeout: 30_000 })
      .toBe(personalName);
  },
);
