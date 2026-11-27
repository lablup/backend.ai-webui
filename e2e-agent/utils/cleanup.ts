import { type Browser, test as base } from "@e2e-dev/web";
import { type App, expect } from "e2e";

const isClientReady = (browser: Browser) =>
  browser
    .evaluate(() => (globalThis as any).backendaiclient?.ready === true)
    .catch(() => false);

// A failed test can leave the page off the app or mid-navigation.
async function ensureClient(app: App, browser: Browser) {
  if (await isClientReady(browser)) return;
  await app.open("/summary");
  await expect
    .poll(() => isClientReady(browser), { timeout: 15_000 })
    .toBe(true);
}

async function destroySession(browser: Browser, name: string) {
  return browser
    .evaluate(async (sessionName: string) => {
      try {
        await (globalThis as any).backendaiclient.destroy(sessionName);
        return "terminated";
      } catch (e: any) {
        if (e?.statusCode === 404) return "already gone";
        return `failed: ${e?.statusCode} ${e?.title ?? e?.msg ?? e}`;
      }
    }, name)
    .catch((e) => `failed: ${e}`);
}

export async function terminateSession(
  app: App,
  browser: Browser,
  name: string,
) {
  let result = await destroySession(browser, name);
  // A navigation can destroy the page context mid-evaluate; retry once.
  if (/context was destroyed|navigation/i.test(result)) {
    await ensureClient(app, browser).catch(() => {});
    result = await destroySession(browser, name);
  }
  console.log(`[cleanup] ${name}: ${result}`);
}

export type VFolderInfo = {
  id: string;
  status: string;
  ownership_type: string;
  group: string | null;
  usage_mode: string;
};

// Finds the folder the signed-in user sees and, with `purge`, deletes it
// forever. The legacy list without a project returns only user-owned folders,
// so it also lists every project the user belongs to.
function vfolderOp(browser: Browser, name: string, purge: boolean) {
  return browser.evaluate(
    async ({ folderName, purge }: { folderName: string; purge: boolean }) => {
      const client = (globalThis as any).backendaiclient;
      if (client?.ready !== true) return { folder: null, result: "not ready" };
      const projects = await client.query(
        `query {
          myUserV2 {
            projects(filter: { isActive: true }, limit: 1000) {
              edges { node { entityId } }
            }
          }
        }`,
        {},
      );
      const groupIds = [
        null,
        ...(projects?.myUserV2?.projects?.edges ?? [])
          .map((edge: any) => edge?.node?.entityId)
          .filter(Boolean),
      ];
      let folder: any = null;
      for (const groupId of groupIds) {
        const folders: any[] = await client.vfolder.list(groupId);
        folder = folders.find((f) => f?.name === folderName) ?? null;
        if (folder) break;
      }
      if (!folder) return { folder: null, result: "already gone" };
      const info = {
        id: folder.id as string,
        status: folder.status as string,
        ownership_type: folder.ownership_type as string,
        group: (folder.group ?? null) as string | null,
        usage_mode: folder.usage_mode as string,
      };
      if (!purge) return { folder: info, result: "found" };
      try {
        if (folder.status === "ready") {
          await client.vfolder.delete_by_id(folder.id);
        }
        await client.vfolder.delete_from_trash_bin(folder.id);
        return { folder: info, result: "deleted" };
      } catch (e: any) {
        return {
          folder: info,
          result: `failed: ${e?.statusCode} ${e?.title ?? e?.msg ?? e}`,
        };
      }
    },
    { folderName: name, purge },
  );
}

// The folder's state as the signed-in user sees it, or null.
export function vfolderInfo(
  browser: Browser,
  name: string,
): Promise<VFolderInfo | null> {
  return vfolderOp(browser, name, false)
    .then((r) => r.folder)
    .catch(() => null);
}

export async function vfolderStatus(browser: Browser, name: string) {
  return (await vfolderInfo(browser, name))?.status ?? "absent";
}

function purgeVFolder(browser: Browser, name: string) {
  return vfolderOp(browser, name, true)
    .then((r) => r.result)
    .catch((e) => `failed: ${e}`);
}

export const test = base.extend<{
  sessionsToCleanup: string[];
  vfoldersToCleanup: string[];
}>({
  sessionsToCleanup: async ({ app, browser }, use) => {
    const names: string[] = [];
    await use(names);
    if (names.length === 0) return;
    try {
      await ensureClient(app, browser);
    } catch (e) {
      console.log(`[cleanup] the app client never became ready: ${e}`);
      return;
    }
    for (const name of names) {
      await terminateSession(app, browser, name);
    }
  },
  vfoldersToCleanup: async ({ app, browser }, use) => {
    const names: string[] = [];
    await use(names);
    if (names.length === 0) return;
    try {
      await ensureClient(app, browser);
    } catch (e) {
      console.log(`[cleanup] the app client never became ready: ${e}`);
      return;
    }
    for (const name of names) {
      let result = await purgeVFolder(browser, name);
      if (/context was destroyed|navigation/i.test(result)) {
        await ensureClient(app, browser).catch(() => {});
        result = await purgeVFolder(browser, name);
      }
      console.log(`[cleanup] ${name}: ${result}`);
    }
  },
});
