import { expect, unique } from "e2e";
import { test, vfolderStatus } from "../utils/cleanup";

// ported from: e2e/vfolder/vfolder-crud.spec.ts › User can create, delete(move to trash), restore, delete forever vFolder
test(
  "User can create, delete(move to trash), restore, delete forever vFolder",
  { session: "admin", timeout: 300_000 },
  async ({ app, agent, screen, browser, vfoldersToCleanup }) => {
    const name = `e2e-agent-vfolder-${Date.now()}`;
    vfoldersToCleanup.push(name);
    const params = { name: unique(name) };
    const row = screen.getByRole("row").filter({ hasText: name });
    const status = () => vfolderStatus(browser, name);

    await app.open("/data");
    await expect(
      screen.getByRole("button", "Create Folder").first(),
    ).toBeVisible({ timeout: 30_000 });

    await agent.act(
      'Press "Create Folder", enter {name} as the folder name and press "Create"',
      { params },
    );
    await expect(row).toBeVisible({ timeout: 15_000 });
    await expect.poll(status, { timeout: 15_000 }).toBe("ready");

    await agent.act(
      'In the "Active" tab, move the folder {name} to the trash bin and confirm',
      { params },
    );
    await expect(row).toBeHidden({ timeout: 15_000 });
    await expect.poll(status, { timeout: 15_000 }).toBe("delete-pending");

    await agent.act(
      'Open the "Trash" tab, press "Restore" on the folder {name} and confirm',
      { params },
    );
    await expect(row).toBeHidden({ timeout: 15_000 });
    await expect.poll(status, { timeout: 15_000 }).toBe("ready");

    await agent.act(
      'Open the "Active" tab, move the folder {name} to the trash bin again and confirm',
      { params },
    );
    await expect(row).toBeHidden({ timeout: 15_000 });
    await expect.poll(status, { timeout: 15_000 }).toBe("delete-pending");

    await agent.act(
      'Open the "Trash" tab, press "Delete" on the folder {name}, type the folder name to confirm and press "Delete forever"',
      { params },
    );
    await expect(row).toBeHidden({ timeout: 15_000 });
    await expect
      .poll(status, { timeout: 30_000 })
      .toMatch(/^(absent|delete-ongoing|delete-complete)$/);
  },
);
