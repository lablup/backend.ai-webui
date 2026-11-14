import { test } from "@e2e-dev/web";
import { expect } from "e2e";
import { currentProjectName, personalProjectName } from "../../utils/project";

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
    await expect.poll(() => currentProjectName(browser)).not.toBe(personalName);

    await agent.act('Open the "Select Project" selector in the header');
    const personalGroup = screen
      .getByRole("listbox", "Select Project")
      .getByRole("group", "Personal");
    await expect(personalGroup).toBeVisible({ timeout: 15_000 });
    // The header labels the personal project "My Project" (#10670).
    await expect(personalGroup.getByRole("option", "My Project")).toBeVisible();

    await agent.act(
      'In the open project list, choose the "My Project" option listed under the "Personal" group',
    );
    await expect(browser).toHaveURL(projectUrl, { timeout: 15_000 });
    await expect(selector).toHaveText(/My Project/);
    await expect
      .poll(() => currentProjectName(browser), { timeout: 15_000 })
      .toBe(personalName);

    await agent.act("Reload the page");
    await expect(browser).toHaveURL(projectUrl, { timeout: 15_000 });
    await expect(selector).toHaveText(/My Project/, { timeout: 30_000 });
    await expect
      .poll(() => currentProjectName(browser), { timeout: 30_000 })
      .toBe(personalName);
  },
);
