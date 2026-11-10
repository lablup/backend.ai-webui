import { expect, unique } from "e2e";
import { test, vfolderInfo } from "../utils/cleanup";
import {
  currentProjectName,
  personalProjectName,
  projectId,
} from "../utils/project";

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ported from: e2e/vfolder/vfolder-type-selection.spec.ts › User creates a user folder without any Type selection
test(
  "the user creates a folder in the current project from the Data page",
  { session: "admin", timeout: 300_000 },
  async ({ app, agent, screen, browser, vfoldersToCleanup }) => {
    const name = `e2e-agent-folder-create-${Date.now()}`;
    vfoldersToCleanup.push(name);
    const params = { name: unique(name) };
    const createDialog = screen
      .getByRole("dialog")
      .filter({ hasText: "Create a new storage folder" })
      .filter({ hasText: "Folder name" });
    const notice = screen
      .getByRole("status")
      .filter({ hasText: "can be seen by the project's other members" });

    await app.open("/data");
    await expect(
      screen.getByRole("button", "Create Folder").first(),
    ).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() => currentProjectName(browser), { timeout: 30_000 })
      .toBeTruthy();
    const project = (await currentProjectName(browser)) as string;
    await expect
      .poll(() => personalProjectName(browser), { timeout: 30_000 })
      .not.toBe(project);
    const groupId = await projectId(browser, project);
    expect(groupId).toBeTruthy();

    await agent.act(
      'Press "Create Folder", read the notice in the dialog that folders created in the current project are visible to its members, then press "Cancel"',
    );
    await expect(createDialog).toBeHidden({ timeout: 15_000 });
    await expect.poll(() => vfolderInfo(browser, name)).toBeNull();

    await agent.act('Press "Create Folder"');
    await expect(createDialog).toBeVisible({ timeout: 15_000 });
    await expect(notice).toBeVisible({ timeout: 15_000 });

    await agent.act('Enter {name} in the "Folder name" field', { params });
    await expect(createDialog.getByRole("textbox", "Folder name")).toHaveValue(
      name,
    );

    await agent.act(
      'Press "Create"; if a confirmation asks whether to create the folder in this project, press "Create" there too without checking "Don\'t ask again"',
    );
    await expect(createDialog).toBeHidden({ timeout: 30_000 });
    await expect(
      screen.getByRole("row").filter({ hasText: name }).first(),
    ).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() => vfolderInfo(browser, name), { timeout: 30_000 })
      .toMatchObject({
        status: "ready",
        ownership_type: "group",
        group: groupId,
      });

    await agent.act(
      "Open the folder {name} from its name link and check that it belongs to the current project",
      { params },
    );
    const explorer = screen.getByRole("dialog").filter({ hasText: name });
    await expect(explorer.first()).toBeVisible({ timeout: 15_000 });
    await expect(explorer.first()).toContainText("Ownership");
    await expect(explorer.first()).toContainText(project);
  },
);

// ported from: e2e/vfolder/vfolder-type-selection.spec.ts › Auto Mount is not offered for project folders
test(
  "the user creates an Auto Mount folder in their personal project",
  { session: "admin", timeout: 300_000 },
  async ({ app, agent, screen, browser, vfoldersToCleanup }) => {
    const name = `.e2e-agent-automount-${Date.now()}`;
    vfoldersToCleanup.push(name);
    const params = { name: unique(name) };
    const createDialog = screen
      .getByRole("dialog")
      .filter({ hasText: "Create a new storage folder" })
      .filter({ hasText: "Folder name" });

    await app.open("/data");
    const selector = screen.getByRole("button", "Select Project");
    await expect(selector).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() => personalProjectName(browser), { timeout: 30_000 })
      .toBeTruthy();
    const personal = (await personalProjectName(browser)) as string;
    const projectUrl = new RegExp(
      `/project/(${escapeRegExp(personal)}|${escapeRegExp(encodeURIComponent(personal))})/data/?($|\\?)`,
    );

    await agent.act(
      'Open the "Select Project" selector in the header and choose your own project listed under the "Personal" group',
    );
    await expect(browser).toHaveURL(projectUrl, { timeout: 15_000 });
    await expect
      .poll(() => currentProjectName(browser), { timeout: 15_000 })
      .toBe(personal);

    await agent.act('Press "Create Folder"');
    await expect(createDialog).toBeVisible({ timeout: 15_000 });
    await expect(createDialog.getByRole("radio", "Auto Mount")).toBeVisible();

    await agent.act('Choose "Auto Mount" as the usage mode');
    await expect(createDialog.getByRole("radio", "Auto Mount")).toBeChecked();

    await agent.act('Enter {name} in the "Folder name" field', { params });
    await expect(createDialog.getByRole("textbox", "Folder name")).toHaveValue(
      name,
    );

    await agent.act('Press "Create"');
    await expect(createDialog).toBeHidden({ timeout: 30_000 });
    await expect(
      screen
        .getByRole("status")
        .filter({ hasText: name })
        .filter({ hasText: "Folder created" })
        .first(),
    ).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() => vfolderInfo(browser, name), { timeout: 30_000 })
      .toMatchObject({ status: "ready", ownership_type: "user" });
  },
);
